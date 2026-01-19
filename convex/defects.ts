import { getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import type { Doc, Id } from './_generated/dataModel'

export const DEFECT_TYPES = [
  { id: 1, label: 'Functional', value: 'functional' },
  { id: 2, label: 'UI and Usability', value: 'ui and usability' },
  { id: 3, label: 'Content', value: 'content' },
  { id: 4, label: 'Improvement Request', value: 'improvement request' },
  { id: 5, label: 'Unit Test Failure', value: 'unit test failure' },
  { id: 6, label: 'Responsiveness', value: 'responsiveness' },
] as const

export const DEFECT_SEVERITIES = [
  { id: 1, label: 'Minor', value: 'minor', color: 'secondary' },
  { id: 2, label: 'Medium', value: 'medium', color: 'default' },
  { id: 3, label: 'Major', value: 'major', color: 'destructive' },
  { id: 4, label: 'Critical', value: 'critical', color: 'destructive' },
  { id: 5, label: 'Blocker', value: 'blocker', color: 'destructive' },
] as const

export const DEFECT_PRIORITIES = [
  { id: 1, label: 'Low', value: 'low', color: 'secondary' },
  { id: 2, label: 'Medium', value: 'medium', color: 'default' },
  { id: 3, label: 'High', value: 'high', color: 'destructive' },
] as const

export const DEFECT_STATUSES = [
  { id: 1, label: 'Open', value: 'open' },
  { id: 2, label: 'In Progress', value: 'in progress' },
  { id: 3, label: 'Fixed', value: 'fixed' },
  { id: 4, label: 'Verified', value: 'verified' },
  { id: 5, label: 'Reopened', value: 'reopened' },
  { id: 6, label: 'Deferred', value: 'deferred' },
  { id: 7, label: 'Hold', value: 'hold' },
] as const

export type DefectType = (typeof DEFECT_TYPES)[number]['value']
export type DefectSeverity = (typeof DEFECT_SEVERITIES)[number]['value']
export type DefectPriority = (typeof DEFECT_PRIORITIES)[number]['value']
export type DefectStatus = (typeof DEFECT_STATUSES)[number]['value']

export const seedDefectOptionsData = mutation({
  args: {},
  returns: v.object({
    types: v.number(),
    severities: v.number(),
    priorities: v.number(),
    statuses: v.number(),
  }),
  handler: async (ctx) => {
    const types = await ctx.db.query('defectTypes').collect()
    const severities = await ctx.db.query('defectSeverities').collect()
    const priorities = await ctx.db.query('defectPriorities').collect()
    const statuses = await ctx.db.query('defectStatuses').collect()

    if (
      types.length > 0 ||
      severities.length > 0 ||
      priorities.length > 0 ||
      statuses.length > 0
    ) {
      return {
        types: types.length,
        severities: severities.length,
        priorities: priorities.length,
        statuses: statuses.length,
      }
    }

    const typeIds: Array<Id<'defectTypes'>> = []
    for (const type of DEFECT_TYPES) {
      const id = await ctx.db.insert('defectTypes', {
        label: type.label,
        value: type.value,
        order: type.id,
      })
      typeIds.push(id)
    }

    const severityIds: Array<Id<'defectSeverities'>> = []
    for (const severity of DEFECT_SEVERITIES) {
      const id = await ctx.db.insert('defectSeverities', {
        label: severity.label,
        value: severity.value,
        color: severity.color,
        order: severity.id,
      })
      severityIds.push(id)
    }

    const priorityIds: Array<Id<'defectPriorities'>> = []
    for (const priority of DEFECT_PRIORITIES) {
      const id = await ctx.db.insert('defectPriorities', {
        label: priority.label,
        value: priority.value,
        color: priority.color,
        order: priority.id,
      })
      priorityIds.push(id)
    }

    const statusIds: Array<Id<'defectStatuses'>> = []
    for (const status of DEFECT_STATUSES) {
      const id = await ctx.db.insert('defectStatuses', {
        label: status.label,
        value: status.value,
        order: status.id,
      })
      statusIds.push(id)
    }

    return {
      types: typeIds.length,
      severities: severityIds.length,
      priorities: priorityIds.length,
      statuses: statusIds.length,
    }
  },
})

export const getDefectTypes = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id('defectTypes'),
      _creationTime: v.number(),
      label: v.string(),
      value: v.string(),
      order: v.number(),
    }),
  ),
  handler: async (ctx) => {
    const types = await ctx.db.query('defectTypes').collect()
    return types.sort((a, b) => a.order - b.order)
  },
})

export const getDefectSeverities = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id('defectSeverities'),
      _creationTime: v.number(),
      label: v.string(),
      value: v.string(),
      color: v.string(),
      order: v.number(),
    }),
  ),
  handler: async (ctx) => {
    const severities = await ctx.db.query('defectSeverities').collect()
    return severities.sort((a, b) => a.order - b.order)
  },
})

export const getDefectPriorities = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id('defectPriorities'),
      _creationTime: v.number(),
      label: v.string(),
      value: v.string(),
      color: v.string(),
      order: v.number(),
    }),
  ),
  handler: async (ctx) => {
    const priorities = await ctx.db.query('defectPriorities').collect()
    return priorities.sort((a, b) => a.order - b.order)
  },
})

export const getDefectStatuses = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id('defectStatuses'),
      _creationTime: v.number(),
      label: v.string(),
      value: v.string(),
      order: v.number(),
    }),
  ),
  handler: async (ctx) => {
    const statuses = await ctx.db.query('defectStatuses').collect()
    return statuses.sort((a, b) => a.order - b.order)
  },
})

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl()
  },
})

export const getFileUrl = query({
  args: {
    storageId: v.id('_storage'),
  },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId)
  },
})

export const listDefects = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id('defects'),
      _creationTime: v.number(),
      projectId: v.id('projects'),
      projectName: v.string(),
      name: v.string(),
      description: v.string(),
      screenshot: v.optional(v.id('_storage')),
      assignedTo: v.optional(v.id('users')),
      assignedToName: v.optional(v.string()),
      reporterId: v.id('users'),
      reporterName: v.string(),
      types: v.array(
        v.object({
          _id: v.id('defectTypes'),
          _creationTime: v.number(),
          label: v.string(),
          value: v.string(),
        }),
      ),
      severity: v.object({
        _id: v.id('defectSeverities'),
        _creationTime: v.number(),
        label: v.string(),
        value: v.string(),
        color: v.string(),
      }),
      priority: v.object({
        _id: v.id('defectPriorities'),
        _creationTime: v.number(),
        label: v.string(),
        value: v.string(),
        color: v.string(),
      }),
      status: v.object({
        _id: v.id('defectStatuses'),
        _creationTime: v.number(),
        label: v.string(),
        value: v.string(),
      }),
      comments: v.optional(
        v.array(
          v.object({
            text: v.string(),
            authorId: v.id('users'),
            timestamp: v.number(),
          }),
        ),
      ),
      statusHistory: v.optional(
        v.array(
          v.object({
            status: v.object({
              _id: v.id('defectStatuses'),
              _creationTime: v.number(),
              label: v.string(),
              value: v.string(),
            }),
            changedBy: v.id('users'),
            timestamp: v.number(),
          }),
        ),
      ),
      updatedAt: v.optional(v.number()),
    }),
  ),
  handler: async (ctx) => {
    if (!(await ctx.auth.getUserIdentity())) {
      throw new Error('Unauthorized')
    }

    const projects = await ctx.db.query('projects').collect()
    const users = await ctx.db.query('users').collect()
    const defects = await ctx.db.query('defects').collect()
    const allSeverities = await ctx.db.query('defectSeverities').collect()
    const allPriorities = await ctx.db.query('defectPriorities').collect()
    const allStatuses = await ctx.db.query('defectStatuses').collect()
    const allTypes = await ctx.db.query('defectTypes').collect()

    if (
      allSeverities.length === 0 ||
      allPriorities.length === 0 ||
      allStatuses.length === 0 ||
      allTypes.length === 0
    ) {
      return []
    }

    const results = []

    for (const defect of defects) {
      const project = projects.find((p) => p._id === defect.projectId)
      const reporter = users.find((u) => u._id === defect.reporterId)
      const assignedTo = users.find((u) => u._id === defect.assignedTo)
      const severity = allSeverities.find((s) => s._id === defect.severity)
      const priority = allPriorities.find((p) => p._id === defect.priority)
      const status = allStatuses.find((s) => s._id === defect.status)
      const types = allTypes.filter((t) => defect.types.includes(t._id))

      if (
        !severity ||
        !priority ||
        !status ||
        !project ||
        !assignedTo ||
        !assignedTo.name ||
        !reporter ||
        !reporter.name
      ) {
        continue
      }

      results.push({
        _id: defect._id,
        _creationTime: defect._creationTime,
        projectId: defect.projectId,
        projectName: project.name,
        name: defect.name,
        types: types.map((t) => ({
          _id: t._id,
          _creationTime: t._creationTime,
          label: t.label,
          value: t.value,
        })),
        description: defect.description,
        screenshot: defect.screenshot,
        assignedTo: defect.assignedTo,
        assignedToName: assignedTo.name,
        reporterId: defect.reporterId,
        reporterName: reporter.name,
        severity: {
          _id: severity._id,
          _creationTime: severity._creationTime,
          label: severity.label,
          value: severity.value,
          color: severity.color,
        },
        priority: {
          _id: priority._id,
          _creationTime: priority._creationTime,
          label: priority.label,
          value: priority.value,
          color: priority.color,
        },
        status: {
          _id: status._id,
          _creationTime: status._creationTime,
          label: status.label,
          value: status.value,
        },
        comments: defect.comments,
        statusHistory: await Promise.all(
          (defect.statusHistory ?? []).map((entry) => {
            const statusEntry = allStatuses.find((s) => s._id === entry.status)

            if (!statusEntry) {
              return null
            }

            return {
              status: {
                _id: statusEntry._id,
                _creationTime: statusEntry._creationTime,
                label: statusEntry.label,
                value: statusEntry.value,
              },
              changedBy: entry.changedBy,
              timestamp: entry.timestamp,
            }
          }),
        ).then(
          (entries) =>
            entries as Array<{
              status: {
                _id: Id<'defectStatuses'>
                _creationTime: number
                label: string
                value: string
              }
              changedBy: Id<'users'>
              timestamp: number
            }>,
        ),
        updatedAt: defect.updatedAt,
      })
    }

    return results
  },
})

export const createDefect = mutation({
  args: {
    projectId: v.id('projects'),
    name: v.string(),
    types: v.array(v.id('defectTypes')),
    description: v.string(),
    screenshot: v.optional(v.id('_storage')),
    assignedTo: v.id('users'),
    severity: v.id('defectSeverities'),
    priority: v.id('defectPriorities'),
    status: v.id('defectStatuses'),
  },
  returns: v.id('defects'),
  handler: async (ctx, args) => {
    if (!(await ctx.auth.getUserIdentity())) {
      throw new Error('Unauthorized')
    }

    const reporterId = await getAuthUserId(ctx)
    if (!reporterId) {
      throw new Error('Unauthorized')
    }

    return await ctx.db.insert('defects', {
      projectId: args.projectId,
      name: args.name,
      types: args.types,
      description: args.description,
      screenshot: args.screenshot,
      assignedTo: args.assignedTo,
      reporterId,
      severity: args.severity,
      priority: args.priority,
      status: args.status,
      comments: [],
      statusHistory: [],
    })
  },
})

export const updateDefect = mutation({
  args: {
    defectId: v.id('defects'),
    projectId: v.optional(v.id('projects')),
    name: v.optional(v.string()),
    types: v.optional(v.array(v.id('defectTypes'))),
    description: v.optional(v.string()),
    screenshot: v.optional(v.id('_storage')),
    assignedTo: v.optional(v.id('users')),
    severity: v.optional(v.id('defectSeverities')),
    priority: v.optional(v.id('defectPriorities')),
    status: v.optional(v.id('defectStatuses')),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (!(await ctx.auth.getUserIdentity())) {
      throw new Error('Unauthorized')
    }

    const defect = await ctx.db.get(args.defectId)
    if (!defect) {
      throw new Error('Defect not found')
    }

    const updates: Partial<
      Pick<
        Doc<'defects'>,
        | 'projectId'
        | 'name'
        | 'types'
        | 'description'
        | 'screenshot'
        | 'assignedTo'
        | 'severity'
        | 'priority'
        | 'status'
        | 'statusHistory'
        | 'updatedAt'
      >
    > = {}

    if (args.projectId !== undefined) {
      updates.projectId = args.projectId
    }

    if (args.name !== undefined) {
      updates.name = args.name
    }

    if (args.types !== undefined) {
      updates.types = args.types
    }

    if (args.description !== undefined) {
      updates.description = args.description
    }

    if (args.screenshot !== undefined) {
      updates.screenshot = args.screenshot
    }

    if (args.assignedTo !== undefined) {
      updates.assignedTo = args.assignedTo
    }

    if (args.severity !== undefined) {
      updates.severity = args.severity
    }

    if (args.priority !== undefined) {
      updates.priority = args.priority
    }

    if (args.status !== undefined && args.status !== defect.status) {
      updates.status = args.status

      const changedBy = await getAuthUserId(ctx)
      if (!changedBy) {
        throw new Error('Unauthorized')
      }

      const statusHistoryEntry = {
        status: args.status,
        changedBy,
        timestamp: Date.now(),
      }

      updates.statusHistory = [
        ...(defect.statusHistory ?? []),
        statusHistoryEntry,
      ]
    }

    updates.updatedAt = Date.now()

    await ctx.db.patch(args.defectId, updates)

    return null
  },
})

export const getDefect = query({
  args: {
    defectId: v.id('defects'),
  },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id('defects'),
      _creationTime: v.number(),
      projectId: v.id('projects'),
      name: v.string(),
      types: v.array(
        v.object({
          _id: v.id('defectTypes'),
          label: v.string(),
          value: v.string(),
        }),
      ),
      description: v.string(),
      screenshot: v.optional(v.id('_storage')),
      assignedTo: v.optional(v.id('users')),
      reporterId: v.id('users'),
      severity: v.object({
        _id: v.id('defectSeverities'),
        label: v.string(),
        value: v.string(),
        color: v.string(),
      }),
      priority: v.object({
        _id: v.id('defectPriorities'),
        label: v.string(),
        value: v.string(),
        color: v.string(),
      }),
      status: v.object({
        _id: v.id('defectStatuses'),
        label: v.string(),
        value: v.string(),
      }),
      comments: v.optional(
        v.array(
          v.object({
            text: v.string(),
            authorId: v.id('users'),
            timestamp: v.number(),
          }),
        ),
      ),
      statusHistory: v.optional(
        v.array(
          v.object({
            status: v.object({
              _id: v.id('defectStatuses'),
              label: v.string(),
              value: v.string(),
            }),
            changedBy: v.id('users'),
            timestamp: v.number(),
          }),
        ),
      ),
      updatedAt: v.optional(v.number()),
    }),
  ),
  handler: async (ctx, args) => {
    if (!(await ctx.auth.getUserIdentity())) {
      throw new Error('Unauthorized')
    }

    const defect = await ctx.db.get(args.defectId)
    if (!defect) {
      return null
    }

    const severity = await ctx.db.get(defect.severity)
    const priority = await ctx.db.get(defect.priority)
    const status = await ctx.db.get(defect.status)
    const types = await Promise.all(
      defect.types.map((typeId) => ctx.db.get(typeId)),
    )

    if (!severity || !priority || !status) {
      return null
    }

    const resolvedTypes = types.filter(
      (t): t is Doc<'defectTypes'> => t !== null,
    )

    return {
      _id: defect._id,
      _creationTime: defect._creationTime,
      projectId: defect.projectId,
      name: defect.name,
      types: resolvedTypes.map((t) => ({
        _id: t._id,
        label: t.label,
        value: t.value,
      })),
      description: defect.description,
      screenshot: defect.screenshot,
      assignedTo: defect.assignedTo,
      reporterId: defect.reporterId,
      severity: {
        _id: severity._id,
        label: severity.label,
        value: severity.value,
        color: severity.color,
      },
      priority: {
        _id: priority._id,
        label: priority.label,
        value: priority.value,
        color: priority.color,
      },
      status: {
        _id: status._id,
        label: status.label,
        value: status.value,
      },
      comments: defect.comments,
      statusHistory: await Promise.all(
        (defect.statusHistory ?? []).map(async (entry) => {
          const statusEntry = await ctx.db.get(entry.status)
          return {
            status: statusEntry
              ? {
                  _id: statusEntry._id,
                  label: statusEntry.label,
                  value: statusEntry.value,
                }
              : null,
            changedBy: entry.changedBy,
            timestamp: entry.timestamp,
          }
        }),
      ).then(
        (entries) =>
          entries.filter((e) => e.status !== null) as Array<{
            status: { _id: Id<'defectStatuses'>; label: string; value: string }
            changedBy: Id<'users'>
            timestamp: number
          }>,
      ),
      updatedAt: defect.updatedAt,
    }
  },
})

export const addComment = mutation({
  args: {
    defectId: v.id('defects'),
    text: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (!(await ctx.auth.getUserIdentity())) {
      throw new Error('Unauthorized')
    }

    const defect = await ctx.db.get(args.defectId)
    if (!defect) {
      throw new Error('Defect not found')
    }

    const authorId = await getAuthUserId(ctx)
    if (!authorId) {
      throw new Error('Unauthorized')
    }

    const newComment = {
      text: args.text,
      authorId,
      timestamp: Date.now(),
    }

    await ctx.db.patch(args.defectId, {
      comments: [...(defect.comments ?? []), newComment],
    })

    return null
  },
})

export const deleteDefect = mutation({
  args: {
    defectId: v.id('defects'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (!(await ctx.auth.getUserIdentity())) {
      throw new Error('Unauthorized')
    }

    const defect = await ctx.db.get(args.defectId)
    if (!defect) {
      throw new Error('Defect not found')
    }

    await ctx.db.delete(args.defectId)
    return null
  },
})

export const getDefectSeverityDistribution = query({
  args: {
    projectId: v.optional(v.union(v.id('projects'), v.null())),
  },
  returns: v.array(
    v.object({
      severity: v.string(),
      count: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    if (!(await ctx.auth.getUserIdentity())) {
      throw new Error('Unauthorized')
    }

    const allSeverities = await ctx.db.query('defectSeverities').collect()
    const defects = await ctx.db.query('defects').collect()

    const filteredDefects = !args.projectId
      ? defects
      : defects.filter((defect) => defect.projectId === args.projectId)

    const severityCounts: Record<string, number> = {}

    for (const severity of allSeverities) {
      severityCounts[severity.label] = 0
    }

    for (const defect of filteredDefects) {
      const severity = allSeverities.find((s) => s._id === defect.severity)
      if (severity) {
        severityCounts[severity.label] =
          (severityCounts[severity.label] || 0) + 1
      }
    }

    const result = allSeverities
      .sort((a, b) => a.order - b.order)
      .map((severity) => ({
        severity: severity.label,
        count: severityCounts[severity.label] || 0,
      }))

    return result
  },
})

export const getDefectsOvertime = query({
  args: {
    projectId: v.optional(v.union(v.id('projects'), v.null())),
  },
  returns: v.object({
    data: v.array(v.any()),
    types: v.array(
      v.object({
        value: v.string(),
        label: v.string(),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    if (!(await ctx.auth.getUserIdentity())) {
      throw new Error('Unauthorized')
    }

    const defects = await ctx.db.query('defects').collect()
    const allTypes = await ctx.db.query('defectTypes').collect()

    const filteredDefects = !args.projectId
      ? defects
      : defects.filter((defect) => defect.projectId === args.projectId)

    const dateMap: Record<string, Record<string, number>> = {}

    for (const defect of filteredDefects) {
      const date = new Date(defect._creationTime)
      const dateStr = date.toISOString().split('T')[0]

      if (!(dateStr in dateMap)) {
        dateMap[dateStr] = {}
        for (const type of allTypes) {
          dateMap[dateStr][type.value] = 0
        }
      }

      const defectTypes = allTypes.filter((t) => defect.types.includes(t._id))
      for (const type of defectTypes) {
        dateMap[dateStr][type.value] += 1
      }
    }

    const data = Object.entries(dateMap)
      .map(([date, counts]) => ({
        date,
        ...counts,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return {
      data,
      types: allTypes.map((t) => ({
        value: t.value,
        label: t.label,
      })),
    }
  },
})
