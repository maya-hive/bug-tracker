import { z } from 'zod'

export const schema = z.object({
  _id: z.string(),
  _creationTime: z.number(),
  name: z.string().optional(),
  email: z.string(),
  role: z.enum(['manager', 'tester', 'developer']).optional(),
})

export type UserTableItem = z.infer<typeof schema>
