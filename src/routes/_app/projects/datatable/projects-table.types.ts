import { z } from 'zod'

export const schema = z.object({
  _id: z.string(),
  _creationTime: z.number(),
  name: z.string(),
  environment: z.enum(['live', 'staging', 'dev']),
})

export type ProjectTableItem = z.infer<typeof schema>
