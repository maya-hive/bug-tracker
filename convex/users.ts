import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { internal } from './_generated/api'
import type { Id } from './_generated/dataModel'

export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    password: v.string(),
    role: v.union(
      v.literal('manager'),
      v.literal('tester'),
      v.literal('developer'),
    ),
  },
  returns: v.id('users'),
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query('users')
      .withIndex('email', (q) => q.eq('email', args.email))
      .first()

    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    // Validate password length (Password provider requires at least 8 characters)
    if (args.password.length < 8) {
      throw new Error('Password must be at least 8 characters long')
    }

    // Create the auth account with password using the store mutation
    // The Password provider's profile function will create the user in the users table
    // with email and name. We'll then update that user with the role.
    // Note: internal.auth.store is registered by convexAuth but may not be in the type definitions
    const result: {
      account: { _id: Id<'authAccounts'>; userId: Id<'users'> }
      user: { _id: Id<'users'> }
    } = await ctx.runMutation((internal as any).auth.store, {
      args: {
        type: 'createAccountFromCredentials',
        provider: 'password',
        account: {
          id: args.email,
          secret: args.password,
        },
        profile: {
          email: args.email,
          name: args.name,
        },
      },
    })

    const userId: Id<'users'> = result.user._id
    await ctx.db.patch(userId, {
      role: args.role,
    })

    return userId
  },
})

export const listUsers = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id('users'),
      _creationTime: v.number(),
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      role: v.optional(
        v.union(
          v.literal('manager'),
          v.literal('tester'),
          v.literal('developer'),
        ),
      ),
    }),
  ),
  handler: async (ctx) => {
    if (!(await ctx.auth.getUserIdentity())) {
      throw new Error('Unauthorized')
    }

    const users = await ctx.db.query('users').collect()
    return users.map((user) => ({
      _id: user._id,
      _creationTime: user._creationTime,
      name: user.name,
      email: user.email,
      role: user.role,
    }))
  },
})

export const updateUser = mutation({
  args: {
    userId: v.id('users'),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.optional(
      v.union(
        v.literal('manager'),
        v.literal('tester'),
        v.literal('developer'),
      ),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (!(await ctx.auth.getUserIdentity())) {
      throw new Error('Unauthorized')
    }

    const user = await ctx.db.get(args.userId)
    if (!user) {
      throw new Error('User not found')
    }

    const updates: {
      name?: string
      email?: string
      role?: 'manager' | 'tester' | 'developer'
    } = {}

    if (args.name !== undefined) {
      updates.name = args.name
    }

    if (args.email !== undefined) {
      updates.email = args.email
    }

    if (args.role !== undefined) {
      updates.role = args.role
    }

    await ctx.db.patch(args.userId, updates)
    return null
  },
})

export const deleteUser = mutation({
  args: {
    userId: v.id('users'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (!(await ctx.auth.getUserIdentity())) {
      throw new Error('Unauthorized')
    }

    const user = await ctx.db.get(args.userId)
    if (!user) {
      throw new Error('User not found')
    }

    await ctx.db.delete(args.userId)
    return null
  },
})

export const changePassword = mutation({
  args: {
    userId: v.id('users'),
    newPassword: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (!(await ctx.auth.getUserIdentity())) {
      throw new Error('Unauthorized')
    }

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
