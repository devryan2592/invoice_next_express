import crypto from 'crypto';

export const generateDocumentNumber = (): string => {
  const year = new Date().getFullYear();
  const month = new Date().toLocaleString('default', { month: 'long' });
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  
  return `${year}-${month}-${randomHex}`;
}; 