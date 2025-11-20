import { convexQuery, useConvexAuth } from '@convex-dev/react-query'
import { Navigate, Outlet, createFileRoute } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import { useQuery } from 'convex/react'

import type { User } from '~/types/user.type'
import { TaskHeader } from '~/components/layout/header'
import { AuthUserContext } from '~/contexts/use-auth-user'

export const Route = createFileRoute('/_app')({
  component: AppLayout,
  beforeLoad: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      convexQuery(api.auth.getAuthUser, {}),
    )
  },
})

function AppLayout() {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const user = useQuery(api.auth.getAuthUser)

  if (isLoading) return null
  if (!isAuthenticated) return <Navigate to="/auth" />
  if (!user) return null

  return (
    <AuthUserContext.Provider value={user as User}>
      <div className="flex-1 flex flex-col overflow-hidden h-screen">
        <TaskHeader />
        <main className="w-full h-full overflow-x-auto p-8">
          <Outlet />
        </main>
      </div>
    </AuthUserContext.Provider>
  )
}
