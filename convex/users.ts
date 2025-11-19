import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * List all users
 */
export const listUsers = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id('users'),
      _creationTime: v.number(),
      name: v.optional(v.string()),
      email: v.optional(v.string()),
    }),
  ),
  handler: async (ctx) => {
    const users = await ctx.db.query('users').collect()
    return users.map((user) => ({
      _id: user._id,
      _creationTime: user._creationTime,
      name: user.name,
      email: user.email,
    }))
  },
})

/**
 * Update user
 */
export const updateUser = mutation({
  args: {
    userId: v.id('users'),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user) {
      throw new Error('User not found')
    }

    const updates: {
      name?: string
      email?: string
    } = {}

    if (args.name !== undefined) {
      updates.name = args.name
    }

    if (args.email !== undefined) {
      updates.email = args.email
    }

    await ctx.db.patch(args.userId, updates)
    return null
  },
})

/**
 * Delete user
 */
export const deleteUser = mutation({
  args: {
    userId: v.id('users'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user) {
      throw new Error('User not found')
    }

    await ctx.db.delete(args.userId)
    return null
  },
})

/**
 * Change user password
 * Note: This updates the account's password hash directly.
 * Password hashing should be done client-side or through the auth API.
 */
export const changePassword = mutation({
  args: {
    userId: v.id('users'),
    newPassword: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user) {
      throw new Error('User not found')
    }

    // Find the account associated with this user
    const accounts = await ctx.db
      .query('authAccounts')
      .withIndex('userIdAndProvider', (q) => q.eq('userId', args.userId))
      .collect()

    if (accounts.length === 0) {
      throw new Error('No account found for user')
    }

    // Note: In a production app, you should hash the password before storing
    // For @convex-dev/auth, password hashing is typically handled by the provider
    // This is a simplified version - you may need to use the auth store's methods
    // or handle password hashing through the Password provider's internal API
    // For now, we'll update the account record
    // In practice, you might want to use the auth store's updatePassword method
    // which requires access to the auth store instance

    // This is a placeholder - actual password updates should go through the auth API
    // or use the Password provider's internal methods
    throw new Error(
      'Password change should be handled through the auth API. Please implement password hashing and use the auth store.',
    )
  },
})
