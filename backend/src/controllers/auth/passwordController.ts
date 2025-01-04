import { Request, Response } from 'express';
import {
  requestPasswordReset,
  resetPassword,
  changePassword,
} from '../../utils/services/auth.service';
import {
  validatePasswordResetRequest,
  validatePasswordReset,
  validatePasswordChange,
} from '../../utils/validators/auth.validator';
import { AppError } from '../../utils/helpers/error';

export const requestReset = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = await validatePasswordResetRequest(req.body);
    await requestPasswordReset(validatedData.email);

    res.status(200).json({
      status: 'success',
      message: 'Password reset instructions sent to your email',
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

export const resetUserPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = await validatePasswordReset(req.body);
    await resetPassword(validatedData.token, validatedData.newPassword);

    res.status(200).json({
      status: 'success',
      message: 'Password reset successful',
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

export const changeUserPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = await validatePasswordChange(req.body);
    const userId = req.user?.id; // Assuming user is attached to request by auth middleware

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    await changePassword(userId, validatedData.currentPassword, validatedData.newPassword);

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully',
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