import { ChevronsUpDown, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { DEFECT_SEVERITIES, DEFECT_TYPES } from 'convex/defects'
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
    filters.assignedTo !== null ||
    filters.reporter !== null

  const clearFilters = () => {
    onFiltersChange({
      severity: null,
      type: null,
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
        onClick={clearFilters}
        disabled={!hasActiveFilters}
        className={cn({
          'text-yellow-600 hover:text-yellow-600': hasActiveFilters,
        })}
      >
        <RotateCcw className="size-4" /> Reset Filters
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
          {DEFECT_SEVERITIES.map((severity) => (
            <SelectItem key={severity.value} value={severity.value}>
              {severity.label}
            </SelectItem>
          ))}
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
          {DEFECT_TYPES.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
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
