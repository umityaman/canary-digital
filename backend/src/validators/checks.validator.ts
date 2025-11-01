import { z } from 'zod'

export const createCheckSchema = z.object({
  checkNumber: z.string().min(1, 'checkNumber is required'),
  type: z.enum(['received', 'issued']).optional().default('received'),
  drawer: z.string().optional(),
  bank: z.string().min(1, 'bank is required'),
  branch: z.string().optional(),
  accountNumber: z.string().optional(),
  amount: z.number().positive('amount must be > 0'),
  issueDate: z.string().refine((v) => !Number.isNaN(Date.parse(v)), { message: 'issueDate must be a valid date string' }),
  dueDate: z.string().refine((v) => !Number.isNaN(Date.parse(v)), { message: 'dueDate must be a valid date string' }),
  status: z.string().optional().default('portfolio'),
  customerId: z.number().int().positive().optional(),
  orderId: z.number().int().positive().optional(),
  notes: z.string().optional(),
})

export const updateCheckSchema = createCheckSchema.partial()

export type CreateCheckInput = z.infer<typeof createCheckSchema>
export type UpdateCheckInput = z.infer<typeof updateCheckSchema>
