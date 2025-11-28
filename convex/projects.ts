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
    }),
  ),
  handler: async (ctx) => {
    if (!(await ctx.auth.getUserIdentity())) {
      throw new Error('Unauthorized')
    }

    const projects = await ctx.db.query('projects').collect()
    return projects.map((project) => ({
      _id: project._id,
      _creationTime: project._creationTime,
      name: project.name,
    }))
  },
})

/**
 * Create a new project
 */
export const createProject = mutation({
  args: {
    name: v.string(),
  },
  returns: v.id('projects'),
  handler: async (ctx, args) => {
    if (!(await ctx.auth.getUserIdentity())) {
      throw new Error('Unauthorized')
    }

    return await ctx.db.insert('projects', {
      name: args.name,
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
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (!(await ctx.auth.getUserIdentity())) {
      throw new Error('Unauthorized')
    }

    const project = await ctx.db.get(args.projectId)
    if (!project) {
      throw new Error('Project not found')
    }

    const updates: {
      name?: string
    } = {}

    if (args.name !== undefined) {
      updates.name = args.name
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
    if (!(await ctx.auth.getUserIdentity())) {
      throw new Error('Unauthorized')
    }

    const project = await ctx.db.get(args.projectId)
    if (!project) {
      throw new Error('Project not found')
    }

    await ctx.db.delete(args.projectId)
    return null
  },
})
