import { z } from 'zod'
import {
  DEFECT_PRIORITIES,
  DEFECT_SEVERITIES,
  DEFECT_STATUSES,
  DEFECT_TYPES,
} from 'convex/defects'
import type {
  DefectPriority,
  DefectSeverity,
  DefectStatus,
  DefectType,
} from 'convex/defects'

// Extract enum values as arrays for validation
const defectTypeValues = DEFECT_TYPES.map(({ value }) => value) as [
  DefectType,
  ...Array<DefectType>,
]
const defectSeverityValues = DEFECT_SEVERITIES.map(({ value }) => value) as [
  DefectSeverity,
  ...Array<DefectSeverity>,
]
const defectPriorityValues = DEFECT_PRIORITIES.map(({ value }) => value) as [
  DefectPriority,
  ...Array<DefectPriority>,
]
const defectStatusValues = DEFECT_STATUSES.map(({ value }) => value) as [
  DefectStatus,
  ...Array<DefectStatus>,
]

/**
 * Zod schema for defect form validation.
 * Accepts strings (including empty strings) as input, validates enum values on submit.
 * Uses the 'value' field from constants (not 'label') to match backend types.
 * The schema validates but doesn't transform, allowing tanstack form to work with string types.
 */
export const defectFormSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  assignedTo: z.string().min(1, 'Assigned To is required'),
  type: z
    .string()
    .min(1, 'Type is required')
    .refine((val) => defectTypeValues.includes(val as DefectType), {
      message: 'Invalid type',
    }),
  severity: z
    .string()
    .min(1, 'Severity is required')
    .refine((val) => defectSeverityValues.includes(val as DefectSeverity), {
      message: 'Invalid severity',
    }),
  priority: z
    .string()
    .min(1, 'Priority is required')
    .refine((val) => defectPriorityValues.includes(val as DefectPriority), {
      message: 'Invalid priority',
    }),
  status: z
    .string()
    .min(1, 'Status is required')
    .refine((val) => defectStatusValues.includes(val as DefectStatus), {
      message: 'Invalid status',
    }),
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
  type: string
  severity: string
  priority: string
  status: string
}

/**
 * Type for validated form values (after zod validation).
 * The values are still strings but guaranteed to be valid enum values.
 * Cast to the specific enum types when calling mutations.
 */
export type DefectFormValues = z.output<typeof defectFormSchema>

/**
 * Default form values for creating a new defect.
 * All values are strings (including empty strings for required fields).
 */
export const defaultDefectFormValues: DefectFormInput = {
  projectId: '',
  name: '',
  type: '',
  description: '',
  assignedTo: '',
  severity: '',
  priority: '',
  status: 'open',
}
