import { getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import type { Id } from './_generated/dataModel'

/**
 * Generate an upload URL for file attachment
 */
export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl()
  },
})

/**
 * List all defects
 */
export const listDefects = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id('defects'),
      _creationTime: v.number(),
      projectId: v.id('projects'),
      projectName: v.string(),
      name: v.string(),
      module: v.string(),
      defectType: v.union(v.literal('bug'), v.literal('improvement')),
      description: v.string(),
      screenshot: v.optional(v.id('_storage')),
      assignedTo: v.optional(v.id('users')),
      assignedToName: v.optional(v.string()),
      reporterId: v.id('users'),
      reporterName: v.string(),
      severity: v.union(
        v.literal('cosmetic'),
        v.literal('medium'),
        v.literal('high'),
        v.literal('critical'),
      ),
      flags: v.array(
        v.union(v.literal('unit test failure'), v.literal('content issue')),
      ),
      status: v.union(
        v.literal('open'),
        v.literal('fixed'),
        v.literal('verified'),
        v.literal('reopened'),
        v.literal('deferred'),
      ),
      comments: v.optional(
        v.array(
          v.object({
            text: v.string(),
            authorId: v.id('users'),
            timestamp: v.number(),
          }),
        ),
      ),
    }),
  ),
  handler: async (ctx) => {
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
        module: defect.module,
        defectType: defect.defectType,
        description: defect.description,
        screenshot: defect.screenshot,
        assignedTo: defect.assignedTo,
        assignedToName: assignedTo
          ? assignedTo.name || assignedTo.email || 'Unknown User'
          : undefined,
        reporterId: defect.reporterId,
        reporterName: reporter?.name || reporter?.email || 'Unknown Reporter',
        severity: defect.severity,
        flags: defect.flags,
        status: defect.status,
        comments: defect.comments,
      })
    }
    return results
  },
})

/**
 * Create a new defect
 */
export const createDefect = mutation({
  args: {
    projectId: v.id('projects'),
    name: v.string(),
    module: v.string(),
    defectType: v.union(v.literal('bug'), v.literal('improvement')),
    description: v.string(),
    screenshot: v.optional(v.id('_storage')),
    assignedTo: v.optional(v.id('users')),
    severity: v.union(
      v.literal('cosmetic'),
      v.literal('medium'),
      v.literal('high'),
      v.literal('critical'),
    ),
    flags: v.optional(
      v.array(
        v.union(v.literal('unit test failure'), v.literal('content issue')),
      ),
    ),
    status: v.union(
      v.literal('open'),
      v.literal('fixed'),
      v.literal('verified'),
      v.literal('reopened'),
      v.literal('deferred'),
    ),
  },
  returns: v.id('defects'),
  handler: async (ctx, args) => {
    const reporterId = await getAuthUserId(ctx)
    if (!reporterId) {
      throw new Error('Unauthorized')
    }

    return await ctx.db.insert('defects', {
      projectId: args.projectId,
      name: args.name,
      module: args.module,
      defectType: args.defectType,
      description: args.description,
      screenshot: args.screenshot,
      assignedTo: args.assignedTo,
      reporterId,
      severity: args.severity,
      flags: args.flags ?? [],
      status: args.status,
      comments: [],
    })
  },
})

/**
 * Update defect
 */
export const updateDefect = mutation({
  args: {
    defectId: v.id('defects'),
    projectId: v.optional(v.id('projects')),
    name: v.optional(v.string()),
    module: v.optional(v.string()),
    defectType: v.optional(v.union(v.literal('bug'), v.literal('improvement'))),
    description: v.optional(v.string()),
    screenshot: v.optional(v.id('_storage')),
    assignedTo: v.optional(v.id('users')),
    severity: v.optional(
      v.union(
        v.literal('cosmetic'),
        v.literal('medium'),
        v.literal('high'),
        v.literal('critical'),
      ),
    ),
    flags: v.optional(
      v.array(
        v.union(v.literal('unit test failure'), v.literal('content issue')),
      ),
    ),
    status: v.optional(
      v.union(
        v.literal('open'),
        v.literal('fixed'),
        v.literal('verified'),
        v.literal('reopened'),
        v.literal('deferred'),
      ),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const defect = await ctx.db.get(args.defectId)
    if (!defect) {
      throw new Error('Defect not found')
    }

    const updates: {
      projectId?: Id<'projects'>
      name?: string
      module?: string
      defectType?: 'bug' | 'improvement'
      description?: string
      screenshot?: Id<'_storage'>
      assignedTo?: Id<'users'>
      severity?: 'cosmetic' | 'medium' | 'high' | 'critical'
      flags?: Array<'unit test failure' | 'content issue'>
      status?: 'open' | 'fixed' | 'verified' | 'reopened' | 'deferred'
    } = {}

    if (args.projectId !== undefined) {
      updates.projectId = args.projectId
    }

    if (args.name !== undefined) {
      updates.name = args.name
    }

    if (args.module !== undefined) {
      updates.module = args.module
    }

    if (args.defectType !== undefined) {
      updates.defectType = args.defectType
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

    if (args.flags !== undefined) {
      updates.flags = args.flags
    }

    if (args.status !== undefined) {
      updates.status = args.status
    }

    await ctx.db.patch(args.defectId, updates)
    return null
  },
})

/**
 * Get a single defect by ID
 */
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
      module: v.string(),
      defectType: v.union(v.literal('bug'), v.literal('improvement')),
      description: v.string(),
      screenshot: v.optional(v.id('_storage')),
      assignedTo: v.optional(v.id('users')),
      reporterId: v.id('users'),
      severity: v.union(
        v.literal('cosmetic'),
        v.literal('medium'),
        v.literal('high'),
        v.literal('critical'),
      ),
      flags: v.array(
        v.union(v.literal('unit test failure'), v.literal('content issue')),
      ),
      status: v.union(
        v.literal('open'),
        v.literal('fixed'),
        v.literal('verified'),
        v.literal('reopened'),
        v.literal('deferred'),
      ),
      comments: v.optional(
        v.array(
          v.object({
            text: v.string(),
            authorId: v.id('users'),
            timestamp: v.number(),
          }),
        ),
      ),
    }),
  ),
  handler: async (ctx, args) => {
    const defect = await ctx.db.get(args.defectId)
    if (!defect) {
      return null
    }

    return {
      _id: defect._id,
      _creationTime: defect._creationTime,
      projectId: defect.projectId,
      name: defect.name,
      module: defect.module,
      defectType: defect.defectType,
      description: defect.description,
      screenshot: defect.screenshot,
      assignedTo: defect.assignedTo,
      reporterId: defect.reporterId,
      severity: defect.severity,
      flags: defect.flags,
      status: defect.status,
      comments: defect.comments,
    }
  },
})

/**
 * Add a comment to a defect
 */
export const addComment = mutation({
  args: {
    defectId: v.id('defects'),
    text: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
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

/**
 * Delete defect
 */
export const deleteDefect = mutation({
  args: {
    defectId: v.id('defects'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const defect = await ctx.db.get(args.defectId)
    if (!defect) {
      throw new Error('Defect not found')
    }

    await ctx.db.delete(args.defectId)
    return null
  },
})
