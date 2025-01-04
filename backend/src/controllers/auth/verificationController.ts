import { Request, Response } from 'express';
import { verifyEmail, resendVerification } from '../../utils/services/auth.service';
import { AppError } from '../../utils/helpers/error';

export const verifyEmailToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    await verifyEmail(token);

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully',
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

export const resendVerificationEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    await resendVerification(email);

    res.status(200).json({
      status: 'success',
      message: 'Verification email sent successfully',
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