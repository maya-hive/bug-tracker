import * as React from 'react'
import usePresence from '@convex-dev/presence/react'
import FacePile from '@convex-dev/presence/facepile'
import { api } from 'convex/_generated/api'

import {
  Braces,
  Bug,
  Calendar as CalendarIcon,
  ChevronDown,
  CirclePlus,
  Folders,
  Users,
} from 'lucide-react'
import { Button } from '~/components/ui/button'
import { ButtonGroup } from '~/components/ui/button-group'
import { ModeToggle } from '~/components/mode-toggle'
import { Calendar } from '~/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { NavUser } from '~/components/nav-user'

export function TaskHeader() {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(
    new Date('2024-09-07'),
  )
  const [name] = React.useState(
    () => 'User ' + Math.floor(Math.random() * 10000),
  )
  const presenceState = usePresence(api.presence, 'my-chat-room', name)

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
            <FacePile presenceState={presenceState ?? []} />
          </div>
          <ModeToggle />
          <NavUser
            user={{
              name: 'John Doe',
              email: 'john.doe@example.com',
              avatar: 'https://api.dicebear.com/9.x/glass/svg?seed=JohnDoe',
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between px-3 lg:px-6 py-3 border-t border-border overflow-x-auto">
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" className="shadow-none">
            <Braces className="size-4" />
            Defects List
          </Button>
          <Button variant="ghost" className="shadow-none">
            <Folders className="size-4" />
            View Projects
          </Button>
          <Button variant="ghost" className="shadow-none">
            <Users className="size-4" />
            Manage Team
          </Button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 hidden lg:flex font-normal"
              >
                <CalendarIcon className="size-4" />
                {date
                  ? date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                captionLayout="dropdown"
                onSelect={(selectedDate: Date | undefined) => {
                  setDate(selectedDate)
                  setOpen(false)
                }}
              />
            </PopoverContent>
          </Popover>
          <DropdownMenu>
            <ButtonGroup>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Quick Create</Button>
              </DropdownMenuTrigger>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <CirclePlus className="size-4" />
                </Button>
              </DropdownMenuTrigger>
            </ButtonGroup>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Bug className="size-4" />
                Create Defect
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Folders className="size-4" />
                Create Project
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Users className="size-4" />
                CreateUser
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
