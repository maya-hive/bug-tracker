import type {
  DefectPriority,
  DefectSeverity,
  DefectStatus,
  DefectType,
} from 'convex/lib/validators'

export const DEFECT_TYPES: Array<DefectType> = [
  'functional',
  'ui and usability',
  'content',
  'improvement request',
  'unit test failure',
]

export const DEFECT_SEVERITIES: Array<DefectSeverity> = [
  'minor',
  'medium',
  'major',
  'critical',
  'blocker',
]

export const DEFECT_PRIORITIES: Array<DefectPriority> = [
  'low',
  'medium',
  'high',
]

export const DEFECT_STATUSES: Array<DefectStatus> = [
  'open',
  'in progress',
  'fixed',
  'verified',
  'reopened',
  'deferred',
  'hold',
]
