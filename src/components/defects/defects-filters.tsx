import { RotateCcw } from 'lucide-react'
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
import { Checkbox } from '~/components/ui/checkbox'

export interface DefectsFilters {
  severity: string | null
  type: string | null
  assignedTo: string | null
  flags: Array<string>
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

const flagOptions = [
  { value: 'unit test failure', label: 'Unit Test Failure' },
  { value: 'content issue', label: 'Content Issue' },
] as const

export function DefectsFilters({
  filters,
  users,
  onFiltersChange,
}: DefectsFiltersProps) {
  const hasActiveFilters =
    filters.severity !== null ||
    filters.type !== null ||
    filters.assignedTo !== null ||
    filters.flags.length > 0

  const clearFilters = () => {
    onFiltersChange({
      severity: null,
      type: null,
      assignedTo: null,
      flags: [],
    })
  }

  const toggleFlag = (flag: string) => {
    const newFlags = filters.flags.includes(flag)
      ? filters.flags.filter((f) => f !== flag)
      : [...filters.flags, flag]
    onFiltersChange({ ...filters, flags: newFlags })
  }

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
          <SelectItem value="bug">Bug</SelectItem>
          <SelectItem value="improvement">Improvement</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.assignedTo || 'all'}
        onValueChange={(value) =>
          onFiltersChange({
            ...filters,
            assignedTo: value === 'all' ? null : value,
          })
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Assigned To" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Assignees</SelectItem>
          <SelectItem value="unassigned">Unassigned</SelectItem>
          {users?.map((user) => (
            <SelectItem key={user._id} value={user._id}>
              {user.name || user.email || 'Unknown'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[140px] justify-between">
            <span
              className={
                filters.flags.length === 0 ? 'text-muted-foreground' : ''
              }
            >
              {filters.flags.length === 0
                ? 'Flags'
                : `${filters.flags.length} selected`}
            </span>
            <svg
              className="h-4 w-4 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-2" align="start">
          <div className="space-y-2">
            {flagOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`flag-${option.value}`}
                  checked={filters.flags.includes(option.value)}
                  onCheckedChange={() => toggleFlag(option.value)}
                />
                <label
                  htmlFor={`flag-${option.value}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {option.label}
                </label>
              </div>
            ))}
            {filters.flags.length > 0 && (
              <div className="pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-8"
                  onClick={() => onFiltersChange({ ...filters, flags: [] })}
                >
                  Clear Flags
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
