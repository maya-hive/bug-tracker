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
    environment: v.union(
      v.literal('live'),
      v.literal('staging'),
      v.literal('dev'),
    ),
  }),
  defects: defineTable({
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
})
