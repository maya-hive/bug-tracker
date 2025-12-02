import type { FunctionReturnType } from 'convex/server'
import type { api } from 'convex/_generated/api'

// Use the actual return type from the query - this automatically stays in sync with the backend
export type DefectTableItem = FunctionReturnType<
  typeof api.defects.listDefects
>[number]
