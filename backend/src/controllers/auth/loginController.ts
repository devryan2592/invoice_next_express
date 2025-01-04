import { Request, Response } from 'express';
import { login, verify2FA } from '../../utils/services/auth.service';
import { validateLogin, validateTwoFactorVerification } from '../../utils/validators/auth.validator';
import { AppError } from '../../utils/helpers/error';

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = await validateLogin(req.body);
    const { user, accessToken, refreshToken, requiresTwoFactor } = await login(
      validatedData.email,
      validatedData.password,
      req,
    );

    if (requiresTwoFactor) {
      res.status(200).json({
        status: 'success',
        message: 'Please enter your 2FA code',
        data: {
          requiresTwoFactor: true,
          userId: user.id,
        },
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }
};

export const verifyTwoFactor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const validatedData = await validateTwoFactorVerification(req.body);
    
    const isValid = await verify2FA(userId, validatedData.code);
    if (!isValid) {
      throw new AppError('Invalid 2FA code', 401);
    }

    res.status(200).json({
      status: 'success',
      message: '2FA verification successful',
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }
}; 