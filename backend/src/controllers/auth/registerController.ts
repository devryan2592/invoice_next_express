import { Request, Response } from 'express';
import { createUser } from '../../utils/services/auth.service';
import { validateRegistration } from '../../utils/validators/auth.validator';
import { AppError } from '../../utils/helpers/error';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = await validateRegistration(req.body);
    const { user, verificationToken } = await createUser(validatedData);

    res.status(201).json({
      status: 'success',
      message: 'Registration successful. Please check your email to verify your account.',
      data: {
        user,
        verificationToken, // Only in development environment
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