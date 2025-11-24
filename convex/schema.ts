import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'
import { authTables } from '@convex-dev/auth/server'

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  numbers: defineTable({
    value: v.number(),
  }),
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
