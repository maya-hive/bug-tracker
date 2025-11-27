import { Password } from '@convex-dev/auth/providers/Password'
import { convexAuth, getAuthUserId } from '@convex-dev/auth/server'
import { query } from './_generated/server'
import type { DataModel } from './_generated/dataModel'
import type { Role } from './lib/permissions'
import type { User } from '@auth/core/types'

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password<DataModel>({
      profile: (params) => {
        return {
          email: params.email as string,
          name: params.name as string | undefined,
        }
      },
    }),
  ],
})

type AuthUser = User & {
  role: Role
}

export const getAuthUser = query({
  args: {},
  handler: async (ctx): Promise<AuthUser | undefined> => {
    const userId = await getAuthUserId(ctx)

    if (!userId) {
      return
    }

    const user = await ctx.db.get(userId)

    if (!user) {
      return
    }

    return {
      id: user._id,
      name: user.name as string,
      email: user.email as string,
      image: `https://api.dicebear.com/9.x/glass/svg?seed=${user._id}`,
      role: user.role as Role,
    }
  },
})
