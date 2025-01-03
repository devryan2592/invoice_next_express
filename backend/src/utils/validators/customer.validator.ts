import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Invalid email address').toLowerCase(),
  accountNo: z.string().optional(),
  vatTinNo: z.number().min(0).default(0),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  phoneNumber: z.string()
    .regex(
      /^\+[1-9]\d{1,14}$/, 
      'Phone number must begin with a "+", followed by country code and number (e.g., +254123456789)'
    ),
});

export type CustomerInput = z.infer<typeof customerSchema>; 