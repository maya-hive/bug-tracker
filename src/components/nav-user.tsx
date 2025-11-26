'use client'

import { LogOut } from 'lucide-react'
import { useAuthActions } from '@convex-dev/auth/react'
import { useNavigate } from '@tanstack/react-router'

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { cn } from '~/lib/utils'

export function NavUser({
  user,
}: {
  user: {
    id: string
    name: string
    email: string
    image: string
  }
}) {
  const { signOut } = useAuthActions()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate({ to: '/auth' })
    } catch (error) {
      console.error('Failed to sign out:', error)
    }
  }

  return (
    <div className="w-full">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start h-12 px-2 text-sm',
              'hover:bg-accent hover:text-accent-foreground',
              'data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
            )}
          >
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback className="rounded-lg">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs">{user.email}</span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
          side="bottom"
        >
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="text-destructive" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
