import { z } from 'zod'

export const defectFormSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  assignedTo: z.string().min(1, 'Assigned To is required'),
  types: z
    .array(z.string())
    .min(1, 'At least one type is required')
    .refine(
      (val) => val.every((id) => typeof id === 'string' && id.length > 0),
      {
        message: 'Invalid type ID in types array',
      },
    ),
  severity: z.string().min(1, 'Severity is required'),
  priority: z.string().min(1, 'Priority is required'),
  status: z.string().min(1, 'Status is required'),
})

export type DefectFormInput = {
  projectId: string
  name: string
  description: string
  assignedTo: string
  types: Array<string>
  severity: string
  priority: string
  status: string
}
