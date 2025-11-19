import { z } from 'zod'

export const schema = z.object({
  _id: z.string(),
  _creationTime: z.number(),
  name: z.string().optional(),
  email: z.string(),
})

export type UserTableItem = z.infer<typeof schema>
