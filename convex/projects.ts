import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * List all projects
 */
export const listProjects = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id('projects'),
      _creationTime: v.number(),
      name: v.string(),
      environment: v.union(
        v.literal('live'),
        v.literal('staging'),
        v.literal('dev'),
      ),
    }),
  ),
  handler: async (ctx) => {
    const projects = await ctx.db.query('projects').collect()
    return projects.map((project) => ({
      _id: project._id,
      _creationTime: project._creationTime,
      name: project.name,
      environment: project.environment,
    }))
  },
})

/**
 * Create a new project
 */
export const createProject = mutation({
  args: {
    name: v.string(),
    environment: v.union(
      v.literal('live'),
      v.literal('staging'),
      v.literal('dev'),
    ),
  },
  returns: v.id('projects'),
  handler: async (ctx, args) => {
    return await ctx.db.insert('projects', {
      name: args.name,
      environment: args.environment,
    })
  },
})

/**
 * Update project
 */
export const updateProject = mutation({
  args: {
    projectId: v.id('projects'),
    name: v.optional(v.string()),
    environment: v.optional(
      v.union(v.literal('live'), v.literal('staging'), v.literal('dev')),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId)
    if (!project) {
      throw new Error('Project not found')
    }

    const updates: {
      name?: string
      environment?: 'live' | 'staging' | 'dev'
    } = {}

    if (args.name !== undefined) {
      updates.name = args.name
    }

    if (args.environment !== undefined) {
      updates.environment = args.environment
    }

    await ctx.db.patch(args.projectId, updates)
    return null
  },
})

/**
 * Delete project
 */
export const deleteProject = mutation({
  args: {
    projectId: v.id('projects'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId)
    if (!project) {
      throw new Error('Project not found')
    }

    await ctx.db.delete(args.projectId)
    return null
  },
})


