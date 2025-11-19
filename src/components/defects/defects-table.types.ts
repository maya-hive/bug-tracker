import { z } from 'zod'

export const schema = z.object({
  _id: z.string(),
  _creationTime: z.number(),
  name: z.string(),
  description: z.string(),
  attachments: z.array(z.string()).optional().default([]),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  status: z.enum(['open', 'in-progress', 'resolved', 'closed']),
})

export type DefectTableItem = z.infer<typeof schema>
