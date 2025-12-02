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
import {
  DEFECT_PRIORITIES,
  DEFECT_SEVERITIES,
  DEFECT_TYPES,
} from '~/lib/defect-constants'

export interface DefectsFilters {
  severity: string | null
  type: string | null
  priority: string | null
  assignedTo: string | null
}

interface DefectsFiltersProps {
  filters: DefectsFilters
  users?: Array<{
    _id: string
    name?: string | null
    email?: string | null
  }>
  onFiltersChange: (filters: DefectsFilters) => void
}

export function DefectsFilters({
  filters,
  users,
  onFiltersChange,
}: DefectsFiltersProps) {
  const [assignedToOpen, setAssignedToOpen] = useState(false)
  const hasActiveFilters =
    filters.severity !== null ||
    filters.type !== null ||
    filters.priority !== null ||
    filters.assignedTo !== null

  const clearFilters = () => {
    onFiltersChange({
      severity: null,
      type: null,
      priority: null,
      assignedTo: null,
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
          {DEFECT_SEVERITIES.map((severity) => (
            <SelectItem key={severity} value={severity}>
              {severity.charAt(0).toUpperCase() + severity.slice(1)}
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
            <SelectItem key={type} value={type}>
              {type
                .split(' ')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')}
            </SelectItem>
          ))}
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
          {DEFECT_PRIORITIES.map((priority) => (
            <SelectItem key={priority} value={priority}>
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
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
    </div>
  )
}
