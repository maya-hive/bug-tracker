import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'
import { authTables } from '@convex-dev/auth/server'
import {
  defectPriorityValidator,
  defectSeverityValidator,
  defectStatusValidator,
  defectTypeValidator,
} from './defects'

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
    description: v.string(),
    assignedTo: v.id('users'),
    reporterId: v.id('users'),
    severity: defectSeverityValidator,
    priority: defectPriorityValidator,
    type: defectTypeValidator,
    status: defectStatusValidator,
    screenshot: v.optional(v.id('_storage')),
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
  }).index('by_project', ['projectId']),
})
