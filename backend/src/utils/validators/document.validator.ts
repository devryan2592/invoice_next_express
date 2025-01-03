import { z } from 'zod';

export const paymentSchema = z.object({
  paidBy: z.string(),
  datePaid: z.string(),
  amountPaid: z.number().positive(),
  paymentMethod: z.enum(['Cash', 'Mobile Money', 'PayPal', 'Credit Card', 'Bank Transfer', 'Others']),
  additionalInfo: z.string().optional(),
});

export const billingItemSchema = z.object({
  itemName: z.string(),
  unitPrice: z.number().positive(),
  quantity: z.number().int().positive(),
  discount: z.string().optional(),
});

export const documentSchema = z.object({
  customerId: z.string().uuid(),
  documentType: z.enum(['Invoice', 'Receipt', 'Quotation']).default('Invoice'),
  dueDate: z.string().datetime(),
  additionalInfo: z.string().optional(),
  termsConditions: z.string().optional(),
  status: z.enum(['Paid', 'Not Fully Paid', 'Not Paid']).default('Not Paid'),
  subTotal: z.number().positive(),
  salesTax: z.number().min(0),
  rates: z.string(),
  total: z.number().positive(),
  currency: z.string(),
  totalAmountReceived: z.number().min(0).default(0),
  billingItems: z.array(billingItemSchema).min(1, 'At least one billing item is required'),
});

export type PaymentInput = z.infer<typeof paymentSchema>;
export type BillingItemInput = z.infer<typeof billingItemSchema>;
export type DocumentInput = z.infer<typeof documentSchema>; 