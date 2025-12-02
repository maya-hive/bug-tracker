import type { FunctionReturnType } from 'convex/server'
import type { api } from 'convex/_generated/api'
import type { Doc, Id } from 'convex/_generated/dataModel'

// Infer types from Convex queries/mutations
export type DefectListItem = FunctionReturnType<
  typeof api.defects.listDefects
>[number]
export type DefectDetail = NonNullable<
  FunctionReturnType<typeof api.defects.getDefect>
>

// Extract argument types from mutations
// Note: We can't directly extract these, so we'll define them based on the function signatures
export type CreateDefectInput = {
  projectId: Id<'projects'>
  name: string
  type: 'functional' | 'ui and usability' | 'content' | 'improvement request' | 'unit test failure'
  description: string
  screenshot?: Id<'_storage'>
  assignedTo?: Id<'users'>
  severity: 'minor' | 'medium' | 'major' | 'critical' | 'blocker'
  priority: 'low' | 'medium' | 'high'
  status: 'open' | 'in progress' | 'fixed' | 'verified' | 'reopened' | 'deferred' | 'hold'
}

export type UpdateDefectInput = {
  defectId: Id<'defects'>
  projectId?: Id<'projects'>
  name?: string
  type?: 'functional' | 'ui and usability' | 'content' | 'improvement request' | 'unit test failure'
  description?: string
  screenshot?: Id<'_storage'>
  assignedTo?: Id<'users'>
  severity?: 'minor' | 'medium' | 'major' | 'critical' | 'blocker'
  priority?: 'low' | 'medium' | 'high'
  status?: 'open' | 'in progress' | 'fixed' | 'verified' | 'reopened' | 'deferred' | 'hold'
}

// Base defect document type from schema
export type DefectDoc = Doc<'defects'>

// Comment type from schema
export type DefectComment = {
  text: string
  authorId: Id<'users'>
  timestamp: number
}

