import { z } from 'zod'

/**
 * Zod schema for defect form validation.
 * All reference fields (types, severity, priority, status) now use IDs.
 */
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

/**
 * Type for form input values (allows empty strings for initial state).
 * All fields are strings to match tanstack form's type inference.
 */
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

/**
 * Type for validated form values (after zod validation).
 * The values are still strings (IDs) but guaranteed to be valid.
 */
export type DefectFormValues = z.output<typeof defectFormSchema>

/**
 * Default form values for creating a new defect.
 * All values are strings (including empty strings for required fields).
 * Note: status will need to be set to a valid status ID after fetching reference data.
 */
export const defaultDefectFormValues: DefectFormInput = {
  projectId: '',
  name: '',
  types: [],
  description: '',
  assignedTo: '',
  severity: '',
  priority: '',
  status: '',
}
