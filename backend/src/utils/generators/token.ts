import { randomBytes } from 'crypto';

export const generateVerificationToken = async (): Promise<string> => {
  return randomBytes(32).toString('hex');
}; 