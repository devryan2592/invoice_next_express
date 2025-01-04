import { Request, Response } from 'express';
import { refreshAccessToken } from '../../utils/services/auth.service';
import { AppError } from '../../utils/helpers/error';

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.body.refreshToken;
    
    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    const newAccessToken = await refreshAccessToken(refreshToken);

    res.status(200).json({
      status: 'success',
      data: {
        accessToken: newAccessToken,
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