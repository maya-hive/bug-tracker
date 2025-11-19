import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import type { Id } from './_generated/dataModel'

/**
 * Generate an upload URL for file attachments
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
      name: v.string(),
      description: v.string(),
      attachments: v.optional(v.array(v.id('_storage'))),
      severity: v.union(
        v.literal('critical'),
        v.literal('high'),
        v.literal('medium'),
        v.literal('low'),
      ),
      status: v.union(
        v.literal('open'),
        v.literal('in-progress'),
        v.literal('resolved'),
        v.literal('closed'),
      ),
    }),
  ),
  handler: async (ctx) => {
    const defects = await ctx.db.query('defects').collect()
    return defects.map((defect) => ({
      _id: defect._id,
      _creationTime: defect._creationTime,
      name: defect.name,
      description: defect.description,
      attachments: defect.attachments ?? [],
      severity: defect.severity,
      status: defect.status,
    }))
  },
})

/**
 * Create a new defect
 */
export const createDefect = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    attachments: v.array(v.id('_storage')),
    severity: v.union(
      v.literal('critical'),
      v.literal('high'),
      v.literal('medium'),
      v.literal('low'),
    ),
    status: v.union(
      v.literal('open'),
      v.literal('in-progress'),
      v.literal('resolved'),
      v.literal('closed'),
    ),
  },
  returns: v.id('defects'),
  handler: async (ctx, args) => {
    return await ctx.db.insert('defects', {
      name: args.name,
      description: args.description,
      attachments: args.attachments,
      severity: args.severity,
      status: args.status,
    })
  },
})

/**
 * Update defect
 */
export const updateDefect = mutation({
  args: {
    defectId: v.id('defects'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    attachments: v.optional(v.array(v.id('_storage'))),
    severity: v.optional(
      v.union(
        v.literal('critical'),
        v.literal('high'),
        v.literal('medium'),
        v.literal('low'),
      ),
    ),
    status: v.optional(
      v.union(
        v.literal('open'),
        v.literal('in-progress'),
        v.literal('resolved'),
        v.literal('closed'),
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
      name?: string
      description?: string
      attachments?: Array<Id<'_storage'>>
      severity?: 'critical' | 'high' | 'medium' | 'low'
      status?: 'open' | 'in-progress' | 'resolved' | 'closed'
    } = {}

    if (args.name !== undefined) {
      updates.name = args.name
    }

    if (args.description !== undefined) {
      updates.description = args.description
    }

    if (args.attachments !== undefined) {
      updates.attachments = args.attachments
    }

    if (args.severity !== undefined) {
      updates.severity = args.severity
    }

    if (args.status !== undefined) {
      updates.status = args.status
    }

    await ctx.db.patch(args.defectId, updates)
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
