import { z } from 'zod'

export const createPromissorySchema = z.object({
  noteNumber: z.string().min(1, 'noteNumber is required'),
  type: z.enum(['received', 'issued']).optional().default('received'),
  drawer: z.string().optional(),
  amount: z.number().positive('amount must be > 0'),
  issueDate: z.string().refine((v) => !Number.isNaN(Date.parse(v)), { message: 'issueDate must be a valid date string' }),
  dueDate: z.string().refine((v) => !Number.isNaN(Date.parse(v)), { message: 'dueDate must be a valid date string' }),
  status: z.string().optional().default('portfolio'),
  aval: z.string().optional(),
  customerId: z.number().int().positive().optional(),
  notes: z.string().optional(),
})

export const updatePromissorySchema = createPromissorySchema.partial()

export type CreatePromissoryInput = z.infer<typeof createPromissorySchema>
export type UpdatePromissoryInput = z.infer<typeof updatePromissorySchema>
