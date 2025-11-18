import { Link } from '@tanstack/react-router'
import { Braces, Folders, Home, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { FileRouteTypes } from '~/routeTree.gen'
import { Button } from '~/components/ui/button'

export interface NavMenuItem {
  readonly icon: LucideIcon
  readonly label: string
  readonly to: FileRouteTypes['to']
}

const navMenuItems = [
  {
    icon: Home,
    label: 'Dashboard',
    to: '/dashboard',
  },
  {
    icon: Braces,
    label: 'Defects List',
    to: '/defects',
  },
  {
    icon: Folders,
    label: 'View Projects',
    to: '/projects',
  },
  {
    icon: Users,
    label: 'Manage Team',
    to: '/users',
  },
] as const satisfies ReadonlyArray<NavMenuItem>

export function NavMenu() {
  return (
    <div className="flex items-center gap-2 shrink-0">
      {navMenuItems.map((item) => {
        const Icon = item.icon
        return (
          <Button key={item.to} variant="ghost" className="shadow-none" asChild>
            <Link to={item.to}>
              <Icon className="size-4" />
              {item.label}
            </Link>
          </Button>
        )
      })}
    </div>
  )
}
