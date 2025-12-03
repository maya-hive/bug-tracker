import {
  Calendar,
  CheckCircle2,
  Circle,
  Loader2,
  PauseCircle,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react'
import type { DefectStatus } from 'convex/lib/validators'
import type { LucideIcon } from 'lucide-react'

export type { DefectStatus }

export interface DefectStatusOption {
  readonly value: DefectStatus
  readonly label: string
}

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

export function getStatusOption(
  value: DefectStatus,
): DefectStatusOption | undefined {
  return DEFECT_STATUS_OPTIONS.find((option) => option.value === value)
}

export function getStatusLabel(value: DefectStatus): string {
  return getStatusOption(value)?.label ?? value
}

export function getStatusOptionsForSelect(): ReadonlyArray<DefectStatusOption> {
  return DEFECT_STATUS_OPTIONS
}

export function getStatusIcon(status: DefectStatus): LucideIcon {
  switch (status) {
    case 'open':
      return Circle
    case 'in progress':
      return Loader2
    case 'fixed':
      return CheckCircle2
    case 'verified':
      return ShieldCheck
    case 'reopened':
      return RefreshCw
    case 'deferred':
      return Calendar
    case 'hold':
      return PauseCircle
    default:
      return Circle
  }
}

export function getStatusIconColor(status: DefectStatus): string {
  switch (status) {
    case 'open':
      return 'text-gray-600 dark:text-gray-500'
    case 'in progress':
      return 'text-yellow-600 dark:text-yellow-500'
    case 'fixed':
      return 'text-blue-600 dark:text-blue-500'
    case 'verified':
      return 'text-green-600 dark:text-green-500'
    case 'reopened':
      return 'text-orange-600 dark:text-orange-500'
    case 'deferred':
      return 'text-gray-600 dark:text-gray-400'
    case 'hold':
      return 'text-red-600 dark:text-red-500'
    default:
      return 'text-muted-foreground'
  }
}
