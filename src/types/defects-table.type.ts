import { z } from 'zod'

export const schema = z.object({
  _id: z.string(),
  _creationTime: z.number(),
  projectId: z.string(),
  projectName: z.string(),
  name: z.string(),
  module: z.string(),
  defectType: z.enum(['bug', 'improvement']),
  description: z.string(),
  screenshot: z.string().optional(),
  assignedTo: z.string().optional(),
  assignedToName: z.string().optional(),
  reporterId: z.string(),
  reporterName: z.string(),
  severity: z.enum(['cosmetic', 'medium', 'high', 'critical']),
  flags: z.array(z.enum(['unit test failure', 'content issue'])),
  status: z.enum(['open', 'fixed', 'verified', 'reopened', 'deferred']),
  comments: z
    .array(
      z.object({
        text: z.string(),
        authorId: z.string(),
        timestamp: z.number(),
      }),
    )
    .optional(),
})

export type DefectTableItem = z.infer<typeof schema>
