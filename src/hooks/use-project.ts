import { parseAsString, useQueryState } from 'nuqs'
import type { Id } from 'convex/_generated/dataModel'

/**
 * Hook to manage project selection in URL search params
 */
export function useProject() {
  const [projectParam, setProjectParam] = useQueryState(
    'project',
    parseAsString.withDefault('all'),
  )

  // Convert 'all' or missing param to null, otherwise use as project ID
  const projectId: Id<'projects'> | null =
    projectParam === 'all' || !projectParam
      ? null
      : (projectParam as Id<'projects'>)

  const setProjectId = (id: Id<'projects'> | null) => {
    // When setting to null (All Projects), remove the param from URL
    if (id === null) {
      setProjectParam(null)
    } else {
      setProjectParam(id)
    }
  }

  return [projectId, setProjectId] as const
}
