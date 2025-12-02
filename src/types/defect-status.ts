import type { DefectStatus } from 'convex/lib/validators'

// Re-export the type for convenience
export type { DefectStatus }

export interface DefectStatusOption {
  readonly value: DefectStatus
  readonly label: string
}

/**
 * Defect status options.
 */
export const DEFECT_STATUS_OPTIONS: ReadonlyArray<DefectStatusOption> = [
  {
    value: 'open',
    label: 'Open',
  },
  {
    value: 'in progress',
    label: 'In Progress',
  },
  {
    value: 'fixed',
    label: 'Fixed',
  },
  {
    value: 'verified',
    label: 'Verified',
  },
  {
    value: 'reopened',
    label: 'Reopened',
  },
  {
    value: 'deferred',
    label: 'Deferred',
  },
  {
    value: 'hold',
    label: 'Hold',
  },
] as const

/**
 * Get a status option by value.
 * @param value - The status value to find
 * @returns The status option or undefined if not found
 */
export function getStatusOption(
  value: DefectStatus,
): DefectStatusOption | undefined {
  return DEFECT_STATUS_OPTIONS.find((option) => option.value === value)
}

/**
 * Get the label for a status value.
 * @param value - The status value
 * @returns The label for the status, or the value itself if not found
 */
export function getStatusLabel(value: DefectStatus): string {
  return getStatusOption(value)?.label ?? value
}

/**
 * Get all status options for a Select component.
 * @returns Array of all status options
 */
export function getStatusOptionsForSelect(): ReadonlyArray<DefectStatusOption> {
  return DEFECT_STATUS_OPTIONS
}
