import { z } from 'zod';

export const userSchema = z.object({
  email: z.string().email('Please provide a valid email').toLowerCase(),
  username: z.string()
    .regex(
      /^[A-z][A-z0-9-_]{3,23}$/,
      'Username must be alphanumeric, without special characters. Hyphens and underscores allowed'
    ),
  firstName: z.string()
    .regex(
      /^[a-zA-Z0-9]+$/,
      'First Name can only have Alphanumeric values. No special characters allowed'
    )
    .trim(),
  lastName: z.string()
    .regex(
      /^[a-zA-Z0-9]+$/,
      'Last Name can only have Alphanumeric values. No special characters allowed'
    )
    .trim(),
  password: z.string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must be at least 8 characters long, with at least 1 uppercase and lowercase letters and at least 1 symbol'
    ),
  passwordConfirm: z.string(),
  businessName: z.string().optional(),
  phoneNumber: z.string()
    .regex(
      /^\+[1-9]\d{1,14}$/,
      'Your mobile phone number must begin with a "+", followed by your country code then actual number e.g +254123456789'
    )
    .default('+254123456789'),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Passwords don't match",
  path: ["passwordConfirm"],
});

export type UserInput = z.infer<typeof userSchema>; 