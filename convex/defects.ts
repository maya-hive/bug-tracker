import { getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import type { Doc } from './_generated/dataModel'

export const DEFECT_TYPES = [
  { id: 1, label: 'Functional', value: 'functional' },
  { id: 2, label: 'UI and Usability', value: 'ui and usability' },
  { id: 3, label: 'Content', value: 'content' },
  { id: 4, label: 'Improvement Request', value: 'improvement request' },
  { id: 5, label: 'Unit Test Failure', value: 'unit test failure' },
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

export const defectTypeValidator = v.union(
  ...DEFECT_TYPES.map(({ value }) => v.literal(value)),
)

export const defectSeverityValidator = v.union(
  ...DEFECT_SEVERITIES.map(({ value }) => v.literal(value)),
)

export const defectPriorityValidator = v.union(
  ...DEFECT_PRIORITIES.map(({ value }) => v.literal(value)),
)

export const defectStatusValidator = v.union(
  ...DEFECT_STATUSES.map(({ value }) => v.literal(value)),
)

export type DefectType = (typeof DEFECT_TYPES)[number]['value']
export type DefectSeverity = (typeof DEFECT_SEVERITIES)[number]['value']
export type DefectPriority = (typeof DEFECT_PRIORITIES)[number]['value']
export type DefectStatus = (typeof DEFECT_STATUSES)[number]['value']

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
      type: defectTypeValidator,
      severity: defectSeverityValidator,
      priority: defectPriorityValidator,
      status: defectStatusValidator,
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
            status: defectStatusValidator,
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

    const defects = await ctx.db.query('defects').collect()
    const results = []

    for (const defect of defects) {
      const project = await ctx.db.get(defect.projectId)
      const reporter = await ctx.db.get(defect.reporterId)
      const assignedTo = defect.assignedTo
        ? await ctx.db.get(defect.assignedTo)
        : null

      results.push({
        _id: defect._id,
        _creationTime: defect._creationTime,
        projectId: defect.projectId,
        projectName: project?.name ?? 'Unknown Project',
        name: defect.name,
        type: defect.type,
        description: defect.description,
        screenshot: defect.screenshot,
        assignedTo: defect.assignedTo,
        assignedToName: assignedTo
          ? assignedTo.name || assignedTo.email || 'Unknown User'
          : undefined,
        reporterId: defect.reporterId,
        reporterName: reporter?.name || reporter?.email || 'Unknown Reporter',
        severity: defect.severity,
        priority: defect.priority,
        status: defect.status,
        comments: defect.comments,
        statusHistory: defect.statusHistory,
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
    type: defectTypeValidator,
    description: v.string(),
    screenshot: v.optional(v.id('_storage')),
    assignedTo: v.id('users'),
    severity: defectSeverityValidator,
    priority: defectPriorityValidator,
    status: defectStatusValidator,
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
      type: args.type,
      description: args.description,
      screenshot: args.screenshot,
      assignedTo: args.assignedTo,
      reporterId,
      severity: args.severity,
      priority: args.priority,
      status: args.status,
      comments: [],
      statusHistory: [
        {
          status: args.status,
          changedBy: reporterId,
          timestamp: Date.now(),
        },
      ],
    })
  },
})

export const updateDefect = mutation({
  args: {
    defectId: v.id('defects'),
    projectId: v.optional(v.id('projects')),
    name: v.optional(v.string()),
    type: v.optional(defectTypeValidator),
    description: v.optional(v.string()),
    screenshot: v.optional(v.id('_storage')),
    assignedTo: v.optional(v.id('users')),
    severity: v.optional(defectSeverityValidator),
    priority: v.optional(defectPriorityValidator),
    status: v.optional(defectStatusValidator),
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
        | 'type'
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

    if (args.type !== undefined) {
      updates.type = args.type
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
      type: defectTypeValidator,
      description: v.string(),
      screenshot: v.optional(v.id('_storage')),
      assignedTo: v.optional(v.id('users')),
      reporterId: v.id('users'),
      severity: defectSeverityValidator,
      priority: defectPriorityValidator,
      status: defectStatusValidator,
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
            status: defectStatusValidator,
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

    return {
      _id: defect._id,
      _creationTime: defect._creationTime,
      projectId: defect.projectId,
      name: defect.name,
      type: defect.type,
      description: defect.description,
      screenshot: defect.screenshot,
      assignedTo: defect.assignedTo,
      reporterId: defect.reporterId,
      severity: defect.severity,
      priority: defect.priority,
      status: defect.status,
      comments: defect.comments,
      statusHistory: defect.statusHistory,
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
