import type { Role } from 'convex/lib/permissions'

export type DefectStatus =
  | 'open'
  | 'fixed'
  | 'verified'
  | 'reopened'
  | 'deferred'

export interface DefectStatusOption {
  readonly value: DefectStatus
  readonly label: string
  readonly restrictTo: ReadonlyArray<Role>
}

/**
 * Defect status options with role-based authorization.
 * Each status can only be set by users with the appropriate role.
 */
export const DEFECT_STATUS_OPTIONS: ReadonlyArray<DefectStatusOption> = [
  {
    value: 'open',
    label: 'Open',
    restrictTo: [],
  },
  {
    value: 'fixed',
    label: 'Fixed',
    restrictTo: ['manager', 'developer'],
  },
  {
    value: 'verified',
    label: 'Verified',
    restrictTo: ['tester'],
  },
  {
    value: 'reopened',
    label: 'Reopened',
    restrictTo: ['tester'],
  },
  {
    value: 'deferred',
    label: 'Deferred',
    restrictTo: ['developer', 'manager'],
  },
] as const

/**
 * Get status options filtered by user role.
 * @param userRole - The role of the current user
 * @returns Array of status options the user is authorized to use
 */
export function getAuthorizedStatusOptions(
  userRole: Role,
): ReadonlyArray<DefectStatusOption> {
  return DEFECT_STATUS_OPTIONS.filter((option) =>
    option.restrictTo.includes(userRole),
  )
}

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
 * Get status options for a Select component, ensuring the current status is included
 * for display purposes even if the user is not authorized to set it.
 * @param userRole - The role of the current user
 * @param currentStatus - The current status value to ensure is displayed
 * @returns Array of status options, with authorized options plus current status if needed
 */
export function getStatusOptionsForSelect(
  userRole: Role,
  currentStatus: DefectStatus,
): ReadonlyArray<DefectStatusOption> {
  const authorizedOptions = getAuthorizedStatusOptions(userRole)
  const currentStatusOption = getStatusOption(currentStatus)

  // If current status is already in authorized options, return as is
  if (authorizedOptions.some((opt) => opt.value === currentStatus)) {
    return authorizedOptions
  }

  // If current status exists but is not authorized, include it for display
  if (currentStatusOption) {
    return [
      ...authorizedOptions,
      currentStatusOption,
    ] as ReadonlyArray<DefectStatusOption>
  }

  // Fallback to authorized options only
  return authorizedOptions
}
