import { ChevronsUpDown, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
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

export interface DashboardFilters {
  severity: string | null
  type: string | null
  priority: string | null
  assignedTo: string | null
  reporter: string | null
}

interface DashboardFiltersProps {
  filters: DashboardFilters
  users?: Array<{
    _id: string
    name?: string | null
    email?: string | null
  }>
  onFiltersChange: (filters: DashboardFilters) => void
}

export function DashboardFilters({
  filters,
  users,
  onFiltersChange,
}: DashboardFiltersProps) {
  const [assignedToOpen, setAssignedToOpen] = useState(false)
  const [reporterOpen, setReporterOpen] = useState(false)
  const hasActiveFilters =
    filters.severity !== null ||
    filters.type !== null ||
    filters.priority !== null ||
    filters.assignedTo !== null ||
    filters.reporter !== null

  const clearFilters = () => {
    onFiltersChange({
      severity: null,
      type: null,
      priority: null,
      assignedTo: null,
      reporter: null,
    })
  }

  const selectedAssignedToUser = users?.find(
    (user) => user._id === filters.assignedTo,
  )
  const assignedToDisplayValue =
    filters.assignedTo === null
      ? 'All Assignees'
      : selectedAssignedToUser?.name ||
        selectedAssignedToUser?.email ||
        'Unknown'

  const selectedReporterUser = users?.find(
    (user) => user._id === filters.reporter,
  )
  const reporterDisplayValue =
    filters.reporter === null
      ? 'All Reporters'
      : selectedReporterUser?.name || selectedReporterUser?.email || 'Unknown'

  return (
    <div className="flex flex-wrap items-center gap-3 flex-1 justify-end">
      <Button
        variant="ghost"
        size="icon"
        onClick={clearFilters}
        disabled={!hasActiveFilters}
        className="h-9 w-9"
        aria-label="Clear all filters"
      >
        <RotateCcw className="size-4" />
      </Button>
      <Select
        value={filters.severity || 'all'}
        onValueChange={(value) =>
          onFiltersChange({
            ...filters,
            severity: value === 'all' ? null : value,
          })
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Severity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Severities</SelectItem>
          <SelectItem value="cosmetic">Cosmetic</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="critical">Critical</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.type || 'all'}
        onValueChange={(value) =>
          onFiltersChange({
            ...filters,
            type: value === 'all' ? null : value,
          })
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="functional">Functional</SelectItem>
          <SelectItem value="ui and usability">UI and Usability</SelectItem>
          <SelectItem value="content">Content</SelectItem>
          <SelectItem value="improvement request">
            Improvement Request
          </SelectItem>
          <SelectItem value="unit test failure">Unit Test Failure</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.priority || 'all'}
        onValueChange={(value) =>
          onFiltersChange({
            ...filters,
            priority: value === 'all' ? null : value,
          })
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
        </SelectContent>
      </Select>

      <Popover open={assignedToOpen} onOpenChange={setAssignedToOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={assignedToOpen}
            className="w-[160px] justify-between"
          >
            {assignedToDisplayValue}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[160px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search user..." />
            <CommandList>
              <CommandEmpty>No user found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="all"
                  onSelect={() => {
                    onFiltersChange({
                      ...filters,
                      assignedTo: null,
                    })
                    setAssignedToOpen(false)
                  }}
                >
                  All Assignees
                </CommandItem>
                {users?.map((user) => {
                  const userLabel = user.name || user.email || 'Unknown'
                  return (
                    <CommandItem
                      key={user._id}
                      value={userLabel}
                      onSelect={() => {
                        onFiltersChange({
                          ...filters,
                          assignedTo: user._id,
                        })
                        setAssignedToOpen(false)
                      }}
                    >
                      {userLabel}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Popover open={reporterOpen} onOpenChange={setReporterOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={reporterOpen}
            className="w-[160px] justify-between"
          >
            {reporterDisplayValue}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[160px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search user..." />
            <CommandList>
              <CommandEmpty>No user found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="all"
                  onSelect={() => {
                    onFiltersChange({
                      ...filters,
                      reporter: null,
                    })
                    setReporterOpen(false)
                  }}
                >
                  All Reporters
                </CommandItem>
                {users?.map((user) => {
                  const userLabel = user.name || user.email || 'Unknown'
                  return (
                    <CommandItem
                      key={user._id}
                      value={userLabel}
                      onSelect={() => {
                        onFiltersChange({
                          ...filters,
                          reporter: user._id,
                        })
                        setReporterOpen(false)
                      }}
                    >
                      {userLabel}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
