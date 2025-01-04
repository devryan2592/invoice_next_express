import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { prisma } from '@utils/db';
import { AppError } from '@utils/helpers/error';
import { Role } from '@prisma/client';
import '@utils/types/env';

interface JwtPayload {
  userId: string;
  iat: number;
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // 1) Get token from header
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      throw new AppError('You are not logged in. Please log in to get access.', 401);
    }

    if (!process.env.JWT_ACCESS_SECRET) {
      throw new Error('JWT access secret is not configured');
    }

    // 2) Verify token
    const decoded = verify(token, process.env.JWT_ACCESS_SECRET) as JwtPayload;

    // 3) Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new AppError('The user belonging to this token no longer exists.', 401);
    }

    // 4) Check if user changed password after the token was issued
    if (user.passwordChangedAt) {
      const changedTimestamp = user.passwordChangedAt.getTime() / 1000;

      if (changedTimestamp > decoded.iat) {
        throw new AppError('User recently changed password! Please log in again.', 401);
      }
    }

    // Grant access to protected route
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
      });
    } else {
      res.status(401).json({
        status: 'error',
        message: 'Invalid token',
      });
    }
  }
};

export const restrictTo = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('You are not logged in. Please log in to get access.', 401);
    }

    if (!req.user.roles.some((role) => roles.includes(role))) {
      throw new AppError('You do not have permission to perform this action', 403);
    }

    next();
  };
}; 