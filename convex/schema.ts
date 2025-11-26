import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'
import { authTables } from '@convex-dev/auth/server'

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    role: v.optional(
      v.union(
        v.literal('manager'),
        v.literal('tester'),
        v.literal('developer'),
      ),
    ),
  })
    .index('email', ['email'])
    .index('phone', ['phone']),
  projects: defineTable({
    name: v.string(),
  }),
  defects: defineTable({
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
  }).index('by_project', ['projectId']),
})
