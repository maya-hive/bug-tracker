import type { Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'

/**
 * Role type represents the possible permission levels in the system.
 * It is derived from the keys of VALID_ROLES.
 */
export type Role = (typeof VALID_ROLES)[keyof typeof VALID_ROLES]

/**
 * Valid roles in the system, in order of increasing privileges:
 */
export const VALID_ROLES = {
  DEVELOPER: 'developer',
  TESTER: 'tester',
  MANAGER: 'manager',
} as const

/**
 * Defines the hierarchy of roles using numeric values.
 * Higher numbers represent more privileges.
 * This allows for easy comparison of role levels using simple numeric comparison.
 */
const roleHierarchy: Record<Role, number> = {
  developer: 3,
  tester: 6,
  manager: 9,
}

/**
 * Checks if a user has sufficient permissions for a required role.
 *
 * @param ctx - The Convex context (works with both Query and Mutation contexts)
 * @param userId - The ID of the user to check permissions for
 * @param requiredRole - The minimum role level required for the operation
 * @returns Promise<boolean> - True if the user has sufficient permissions, false otherwise
 *
 * @example
 * // Check if a user has write permissions
 * const canWrite = await checkPermission(ctx, userId, "write");
 * if (!canWrite) throw new Error("Insufficient permissions");
 */
export async function checkPermission(
  ctx: QueryCtx | MutationCtx,
  userId: Id<'users'>,
  requiredRole: Role,
): Promise<boolean> {
  const user = await ctx.db.get(userId)

  /*
   * If the user doesn't exist, or the role is not valid, return false
   * This handles cases where:
   * 1. The user ID is invalid or the user was deleted
   * 2. The user object doesn't have a role field
   * 3. The user's role is not one of the valid roles
   */
  if (!user || !user.role || !(user.role in roleHierarchy)) return false

  // Compare the user's role level against the required role level
  return roleHierarchy[user.role] >= roleHierarchy[requiredRole]
}
