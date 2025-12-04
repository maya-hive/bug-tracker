import { Link, useLocation } from '@tanstack/react-router'
import { Braces, Folders, Home, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { FileRouteTypes } from '~/routeTree.gen'
import type { Role } from 'convex/lib/permissions'
import { Button } from '~/components/ui/button'
import { useAuthUser } from '~/contexts/use-auth-user'
import { cn } from '~/lib/utils'

export interface NavMenuItem {
  readonly icon: LucideIcon
  readonly label: string
  readonly to: FileRouteTypes['to']
  readonly restrictTo: Array<Role>
}
;[]

const navMenuItems = [
  {
    icon: Home,
    label: 'Dashboard',
    to: '/dashboard',
    restrictTo: ['manager', 'developer', 'tester'],
  },
  {
    icon: Braces,
    label: 'Defects List',
    to: '/defects',
    restrictTo: ['manager', 'developer', 'tester'],
  },
  {
    icon: Folders,
    label: 'View Projects',
    to: '/projects',
    restrictTo: ['manager', 'tester'],
  },
  {
    icon: Users,
    label: 'Manage Team',
    to: '/users',
    restrictTo: ['manager'],
  },
] as const satisfies ReadonlyArray<NavMenuItem>

export function NavMenu() {
  const location = useLocation()
  const currentSearch = location.search
  const user = useAuthUser()

  const authorizedItems = navMenuItems.filter((item) => {
    const userRole = user.role as Role
    return (item.restrictTo as ReadonlyArray<Role>).includes(userRole)
  })

  const normalizePath = (path: string) => {
    const withoutQuery = path.split('?')[0]
    return withoutQuery === '/' ? withoutQuery : withoutQuery.replace(/\/$/, '')
  }
  const currentPathname = normalizePath(location.pathname)

  return (
    <div className="flex items-center gap-2 shrink-0">
      {authorizedItems.map((item) => {
        const Icon = item.icon
        const itemPathname = normalizePath(item.to)
        const isActive = currentPathname === itemPathname

        return (
          <Button
            key={item.to}
            variant="ghost"
            className={cn('shadow-none', isActive && 'bg-accent')}
            asChild
          >
            <Link to={item.to} search={currentSearch}>
              <Icon className="size-4" />
              {item.label}
            </Link>
          </Button>
        )
      })}
    </div>
  )
}
