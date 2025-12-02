import { v } from 'convex/values'

export const defectTypeValidator = v.union(
  v.literal('functional'),
  v.literal('ui and usability'),
  v.literal('content'),
  v.literal('improvement request'),
  v.literal('unit test failure'),
)

export const defectSeverityValidator = v.union(
  v.literal('minor'),
  v.literal('medium'),
  v.literal('major'),
  v.literal('critical'),
  v.literal('blocker'),
)

export const defectPriorityValidator = v.union(
  v.literal('low'),
  v.literal('medium'),
  v.literal('high'),
)

export const defectStatusValidator = v.union(
  v.literal('open'),
  v.literal('in progress'),
  v.literal('fixed'),
  v.literal('verified'),
  v.literal('reopened'),
  v.literal('deferred'),
  v.literal('hold'),
)

// Export TypeScript types for frontend use
// These types must match the literal values in the validators above
export type DefectType =
  | 'functional'
  | 'ui and usability'
  | 'content'
  | 'improvement request'
  | 'unit test failure'

export type DefectSeverity =
  | 'minor'
  | 'medium'
  | 'major'
  | 'critical'
  | 'blocker'

export type DefectPriority = 'low' | 'medium' | 'high'

export type DefectStatus =
  | 'open'
  | 'in progress'
  | 'fixed'
  | 'verified'
  | 'reopened'
  | 'deferred'
  | 'hold'
