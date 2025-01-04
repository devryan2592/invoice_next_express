import { PrismaClient, User } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { authenticator } from 'otplib';
import { sign, verify } from 'jsonwebtoken';
import { Request } from 'express';
import UAParser from 'ua-parser-js';

import { prisma } from '@utils/db';
import { AppError } from '@utils/helpers/error';
import { generateVerificationToken } from '@utils/generators/token';
import { sendVerificationEmail, sendPasswordResetEmail, send2FACode } from '@utils/helpers/email';
import { UserWithoutPassword } from '@utils/types/user';

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_EXPIRES = '7d';
const VERIFICATION_TOKEN_EXPIRES = 24 * 60 * 60 * 1000; // 24 hours

export const createUser = async (userData: {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
}): Promise<{ user: UserWithoutPassword; verificationToken: string }> => {
  const hashedPassword = await hash(userData.password, SALT_ROUNDS);
  const twoFactorSecret = authenticator.generateSecret();

  const user = await prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword,
      twoFactorSecret,
    },
  });

  const verificationToken = await createEmailVerification(user.id);
  await sendVerificationEmail(user.email, verificationToken);

  const { password, twoFactorSecret: secret, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, verificationToken };
};

export const verifyEmail = async (token: string): Promise<void> => {
  const verification = await prisma.emailVerification.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!verification) {
    throw new AppError('Invalid verification token', 400);
  }

  if (verification.expiresAt < new Date()) {
    throw new AppError('Verification token has expired', 400);
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: verification.userId },
      data: { isEmailVerified: true },
    }),
    prisma.emailVerification.delete({
      where: { id: verification.id },
    }),
  ]);
};

export const resendVerification = async (email: string): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.isEmailVerified) {
    throw new AppError('Email is already verified', 400);
  }

  const verificationToken = await createEmailVerification(user.id);
  await sendVerificationEmail(user.email, verificationToken);
};

export const login = async (
  email: string,
  password: string,
  req: Request,
): Promise<{
  user: UserWithoutPassword;
  accessToken: string;
  refreshToken: string;
  requiresTwoFactor: boolean;
}> => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await compare(password, user.password))) {
    throw new AppError('Invalid credentials', 401);
  }

  if (!user.isEmailVerified) {
    throw new AppError('Please verify your email first', 401);
  }

  const { accessToken, refreshToken } = await createTokens(user.id);
  await createSession(user.id, refreshToken, req);

  const { password: _, twoFactorSecret: __, ...userWithoutPassword } = user;
  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
    requiresTwoFactor: user.twoFactorEnabled,
  };
};

export const verify2FA = async (
  userId: string,
  code: string,
): Promise<boolean> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.twoFactorSecret) return false;

  return authenticator.verify({
    token: code,
    secret: user.twoFactorSecret,
  });
};

export const refreshAccessToken = async (refreshToken: string): Promise<string> => {
  const session = await prisma.session.findUnique({
    where: { refreshToken },
    include: { user: true },
  });

  if (!session || !session.isValid || session.expiresAt < new Date()) {
    await invalidateAllUserSessions(session?.userId);
    throw new AppError('Invalid refresh token', 401);
  }

  const accessToken = createAccessToken(session.userId);
  return accessToken;
};

export const requestPasswordReset = async (email: string): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const resetToken = await generateVerificationToken();
  const hashedToken = await hash(resetToken, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordChangedAt: new Date(),
    },
  });

  await sendPasswordResetEmail(email, resetToken);
};

export const resetPassword = async (
  token: string,
  newPassword: string,
): Promise<void> => {
  const hashedPassword = await hash(newPassword, SALT_ROUNDS);
  const user = await prisma.user.findFirst({
    where: {
      passwordChangedAt: {
        gt: new Date(Date.now() - VERIFICATION_TOKEN_EXPIRES),
      },
    },
  });

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordChangedAt: new Date(),
    },
  });

  await invalidateAllUserSessions(user.id);
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !(await compare(currentPassword, user.password))) {
    throw new AppError('Invalid current password', 401);
  }

  const hashedPassword = await hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      passwordChangedAt: new Date(),
    },
  });

  await invalidateAllUserSessions(userId);
};

// Helper functions
const createEmailVerification = async (userId: string): Promise<string> => {
  const token = await generateVerificationToken();
  await prisma.emailVerification.upsert({
    where: { userId },
    update: {
      token,
      expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_EXPIRES),
    },
    create: {
      userId,
      token,
      expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_EXPIRES),
    },
  });
  return token;
};

const createAccessToken = (userId: string): string => {
  return sign({ userId }, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: ACCESS_TOKEN_EXPIRES,
  });
};

const createRefreshToken = (userId: string): string => {
  return sign({ userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: REFRESH_TOKEN_EXPIRES,
  });
};

const createTokens = async (
  userId: string,
): Promise<{ accessToken: string; refreshToken: string }> => {
  const accessToken = createAccessToken(userId);
  const refreshToken = createRefreshToken(userId);
  return { accessToken, refreshToken };
};

const createSession = async (
  userId: string,
  refreshToken: string,
  req: Request,
): Promise<void> => {
  const ua = new UAParser(req.headers['user-agent']);
  const userAgent = JSON.stringify({
    browser: ua.getBrowser(),
    os: ua.getOS(),
    device: ua.getDevice(),
  });

  await prisma.session.create({
    data: {
      userId,
      refreshToken,
      userAgent,
      ipAddress: req.ip,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });
};

const invalidateAllUserSessions = async (userId?: string): Promise<void> => {
  if (!userId) return;
  
  await prisma.session.updateMany({
    where: { userId },
    data: { isValid: false },
  });
}; 