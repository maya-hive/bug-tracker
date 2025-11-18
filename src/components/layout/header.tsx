import { Bug, Folders } from 'lucide-react'
import type { User } from '@auth/core/types'

import { Button } from '~/components/ui/button'
import { ModeToggle } from '~/components/mode-toggle'
import { NavUser } from '~/components/nav-user'
import { UserPresence } from '~/components/user-presence'
import { useAuthUser } from '~/contexts/use-auth-user'
import { NavMenu } from '~/components/layout/nav-menu'

export function TaskHeader() {
  const user = useAuthUser()

  return (
    <div className="border-b border-border bg-background">
      <div className="flex items-center justify-between px-3 lg:px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-3">
            <Bug className="size-6" />
            <h1 className="text-base lg:text-lg font-semibold">Bug Tracker</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
            <UserPresence />
          </div>
          <ModeToggle />
          {user && <UserOverview user={user} />}
        </div>
      </div>

      <div className="flex items-center justify-between px-3 lg:px-6 py-3 border-t border-border overflow-x-auto">
        <NavMenu />
        <ActionItems />
      </div>
    </div>
  )
}

const ActionItems = () => (
  <div className="flex items-center gap-2 shrink-0">
    <Button variant="outline">
      <Bug className="size-4" />
      Create Defect
    </Button>
    <Button variant="outline">
      <Folders className="size-4" />
      Create Project
    </Button>
  </div>
)

const UserOverview = ({ user }: { user: User }) => (
  <NavUser
    user={{
      name: user.name ?? 'User',
      email: user.email ?? '',
      avatar:
        user.image ?? `https://api.dicebear.com/9.x/glass/svg?seed=${user.id}`,
    }}
  />
)
