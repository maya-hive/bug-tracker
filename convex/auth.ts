import { Password } from '@convex-dev/auth/providers/Password'
import { convexAuth, getAuthUserId } from '@convex-dev/auth/server'
import { query } from './_generated/server'
import type { User } from '@auth/core/types'
import type { DataModel } from './_generated/dataModel'

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

export const getAuthUser = query({
  args: {},
  handler: async (ctx): Promise<User | undefined> => {
    const userId = await getAuthUserId(ctx)

    if (!userId) {
      return
    }

    const user = await ctx.db.get(userId)

    if (!user) {
      return
    }

    return user
  },
})
