import { Bug, Check, ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'

import { ModeToggle } from '~/components/mode-toggle'
import { NavUser } from '~/components/nav-user'
import { UserPresence } from '~/components/user-presence'
import { useAuthUser } from '~/contexts/use-auth-user'
import { NavMenu } from '~/components/layout/nav-menu'
import { Button } from '~/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/components/ui/command'
import { cn } from '~/lib/utils'

export function TaskHeader() {
  const user = useAuthUser()
  const [open, setOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Id<'projects'> | null>(
    null,
  )
  const projects = useQuery(api.projects.listProjects)

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
          <NavUser user={user} />
        </div>
      </div>

      <div className="flex items-center justify-between pl-1 pr-3 lg:pl-3 lg:pr-6 py-3 border-t border-border overflow-x-auto">
        <NavMenu />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[200px] justify-between"
            >
              {selectedProject && projects
                ? projects.find((project) => project._id === selectedProject)
                    ?.name
                : 'All Projects'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search project..." />
              <CommandList>
                <CommandEmpty>No project found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="all"
                    onSelect={() => {
                      setSelectedProject(null)
                      setOpen(false)
                    }}
                  >
                    All Projects
                  </CommandItem>
                  {projects?.map((project) => (
                    <CommandItem
                      key={project._id}
                      value={project.name}
                      onSelect={() => {
                        setSelectedProject(
                          project._id === selectedProject ? null : project._id,
                        )
                        setOpen(false)
                      }}
                    >
                      {project.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
