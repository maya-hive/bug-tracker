import { ChevronsUpDown, LayoutGrid, RotateCcw, Table } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useDebouncedCallback } from '@tanstack/react-pacer'
import {
  DEFECT_PRIORITIES,
  DEFECT_SEVERITIES,
  DEFECT_STATUSES,
  DEFECT_TYPES,
} from 'convex/defects'
import type { DefectStatus } from 'convex/defects'
import { Input } from '~/components/ui/input'
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
  getStatusIcon,
  getStatusIconColor,
  getStatusLabel,
} from '~/components/defects/defect-status'
import { cn } from '~/lib/utils'
import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle-group'

export interface DefectsFilters {
  search: string | null
  severity: string | null
  type: string | null
  priority: string | null
  status: string | null
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
  viewMode: 'table' | 'cards'
  setViewMode: (viewMode: 'table' | 'cards') => void
}

export function DefectsFilters({
  filters,
  users,
  onFiltersChange,
  viewMode,
  setViewMode,
}: DefectsFiltersProps) {
  const [assignedToOpen, setAssignedToOpen] = useState(false)
  const [searchInput, setSearchInput] = useState(filters.search || '')

  const filtersRef = useRef(filters)
  filtersRef.current = filters

  useEffect(() => {
    setSearchInput(filters.search || '')
  }, [filters.search])

  const debouncedSearch = useDebouncedCallback(
    (value: string) => {
      onFiltersChange({
        ...filtersRef.current,
        search: value.trim() === '' ? null : value,
      })
    },
    {
      wait: 300,
    },
  )

  const hasActiveFilters =
    (filters.search !== null && filters.search.trim() !== '') ||
    filters.severity !== null ||
    filters.type !== null ||
    filters.priority !== null ||
    filters.status !== null ||
    filters.assignedTo !== null

  const clearFilters = () => {
    onFiltersChange({
      search: null,
      severity: null,
      type: null,
      priority: null,
      status: null,
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
    <div className="flex flex-wrap items-center gap-3 justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search"
          className="w-[150px] lg:w-[250px]"
          value={searchInput}
          onChange={(e) => {
            const value = e.target.value
            setSearchInput(value)
            debouncedSearch(value)
          }}
        />
        <Select
          value={filters.severity || 'all'}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              severity: value === 'all' ? null : value,
            })
          }
        >
          <SelectTrigger>
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
          <SelectTrigger>
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

        <Select
          value={filters.priority || 'all'}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              priority: value === 'all' ? null : value,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {DEFECT_PRIORITIES.map((priority) => (
              <SelectItem key={priority.value} value={priority.value}>
                {priority.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status || 'all'}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              status: value === 'all' ? null : value,
            })
          }
        >
          <SelectTrigger>
            <div className="flex items-center gap-2">
              {filters.status ? (
                <>
                  {(() => {
                    const StatusIcon = getStatusIcon(
                      filters.status as DefectStatus,
                    )
                    const statusIconColor = getStatusIconColor(
                      filters.status as DefectStatus,
                    )
                    return (
                      <StatusIcon className={cn('size-4', statusIconColor)} />
                    )
                  })()}
                  <SelectValue>
                    {getStatusLabel(filters.status as DefectStatus)}
                  </SelectValue>
                </>
              ) : (
                <SelectValue placeholder="Status" />
              )}
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {DEFECT_STATUSES.map((status) => {
              const StatusIcon = getStatusIcon(status.value)
              const statusIconColor = getStatusIconColor(status.value)
              return (
                <SelectItem key={status.value} value={status.value}>
                  <div className="flex items-center gap-2">
                    <StatusIcon className={cn('size-4', statusIconColor)} />
                    <span>{status.label}</span>
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>

        <Popover open={assignedToOpen} onOpenChange={setAssignedToOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={assignedToOpen}
            >
              {assignedToDisplayValue}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-[200px]" align="start">
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
      </div>
      <ToggleGroup
        type="single"
        value={viewMode}
        onValueChange={(value) => {
          if (value === 'table' || value === 'cards') {
            setViewMode(value)
          }
        }}
        variant="outline"
      >
        <ToggleGroupItem value="cards" aria-label="Card view">
          <LayoutGrid className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="table" aria-label="Table view">
          <Table className="size-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
