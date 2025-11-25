import { MessageSquare, Pencil, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from 'convex/_generated/api'
import { toast } from 'sonner'
import type { DefectTableItem } from './defects-table.types'
import type { ColumnDef } from '@tanstack/react-table'
import type { Id } from 'convex/_generated/dataModel'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

function NameCell({ row }: { row: { original: DefectTableItem } }) {
  return <div className="font-medium">{row.original.name}</div>
}

function SeverityCell({ row }: { row: { original: DefectTableItem } }) {
  const severityColors = {
    critical: 'destructive',
    high: 'destructive',
    medium: 'default',
    cosmetic: 'secondary',
  } as const

  return (
    <Badge variant={severityColors[row.original.severity]}>
      {row.original.severity}
    </Badge>
  )
}

const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'fixed', label: 'Fixed' },
  { value: 'verified', label: 'Verified' },
  { value: 'reopened', label: 'Reopened' },
  { value: 'deferred', label: 'Deferred' },
] as const

function StatusCell({ row }: { row: { original: DefectTableItem } }) {
  const updateDefect = useMutation(api.defects.updateDefect)
  const [statusUpdating, setStatusUpdating] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    setStatusUpdating(true)
    try {
      await updateDefect({
        defectId: row.original._id as Id<'defects'>,
        status: newStatus as DefectTableItem['status'],
      })
      toast.success('Status updated successfully')
    } catch (error) {
      toast.error('Failed to update status')
      console.error(error)
    } finally {
      setStatusUpdating(false)
    }
  }

  const currentStatus = row.original.status

  return (
    <Select
      value={currentStatus}
      onValueChange={handleStatusChange}
      disabled={statusUpdating}
    >
      <SelectTrigger className="w-fit" size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function StatusCellReadOnly({ row }: { row: { original: DefectTableItem } }) {
  const statusLabel =
    statusOptions.find((opt) => opt.value === row.original.status)?.label ||
    row.original.status

  return (
    <Badge variant="outline" className="text-sm">
      {statusLabel}
    </Badge>
  )
}

function ProjectCell({ row }: { row: { original: DefectTableItem } }) {
  return <div className="text-sm font-medium">{row.original.projectName}</div>
}

function ModuleCell({ row }: { row: { original: DefectTableItem } }) {
  return <div className="text-sm">{row.original.module}</div>
}

function DefectTypeCell({ row }: { row: { original: DefectTableItem } }) {
  return (
    <Badge
      variant={row.original.defectType === 'bug' ? 'destructive' : 'default'}
    >
      {row.original.defectType}
    </Badge>
  )
}

function AssignedToCell({ row }: { row: { original: DefectTableItem } }) {
  return (
    <div className="text-sm text-muted-foreground">
      {row.original.assignedToName || 'Unassigned'}
    </div>
  )
}

function ReporterCell({ row }: { row: { original: DefectTableItem } }) {
  return (
    <div className="text-sm text-muted-foreground">
      {row.original.reporterName}
    </div>
  )
}

function FlagsCell({ row }: { row: { original: DefectTableItem } }) {
  const flags = row.original.flags
  if (flags.length === 0) {
    return <div className="text-sm text-muted-foreground">No flags</div>
  }
  return (
    <div className="flex flex-wrap gap-1">
      {flags.map((flag, index) => (
        <Badge key={index} variant="outline" className="text-xs">
          {flag}
        </Badge>
      ))}
    </div>
  )
}

function CreatedDateCell({ row }: { row: { original: DefectTableItem } }) {
  return (
    <div className="text-muted-foreground text-sm">
      {format(new Date(row.original._creationTime), 'MMM d, yyyy')}
    </div>
  )
}

function ActionsCell({
  row,
  onEdit,
  onDelete,
  onAddComment,
}: {
  row: { original: DefectTableItem }
  onEdit: (defect: DefectTableItem) => void
  onDelete: (defect: DefectTableItem) => void
  onAddComment: (defect: DefectTableItem) => void
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        onClick={() => onAddComment(row.original)}
        aria-label="Add comment"
      >
        <MessageSquare className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        onClick={() => onEdit(row.original)}
        aria-label="Edit defect"
      >
        <Pencil className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={() => onDelete(row.original)}
        aria-label="Delete defect"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  )
}

export function createDashboardColumns(): Array<ColumnDef<DefectTableItem>> {
  return [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <NameCell row={row} />,
    },
    {
      accessorKey: 'projectId',
      header: 'Project',
      cell: ({ row }) => <ProjectCell row={row} />,
    },
    {
      accessorKey: 'defectType',
      header: 'Type',
      cell: ({ row }) => <DefectTypeCell row={row} />,
    },
    {
      accessorKey: 'severity',
      header: 'Severity',
      cell: ({ row }) => <SeverityCell row={row} />,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusCellReadOnly row={row} />,
    },
    {
      accessorKey: 'assignedTo',
      header: 'Assigned To',
      cell: ({ row }) => <AssignedToCell row={row} />,
    },
    {
      accessorKey: 'reporterId',
      header: 'Reporter',
      cell: ({ row }) => <ReporterCell row={row} />,
    },
    {
      accessorKey: 'flags',
      header: 'Flags',
      cell: ({ row }) => <FlagsCell row={row} />,
    },
    {
      accessorKey: '_creationTime',
      header: 'Created',
      cell: ({ row }) => <CreatedDateCell row={row} />,
    },
  ]
}

export function createDefectsColumns(
  onEdit: (defect: DefectTableItem) => void,
  onDelete: (defect: DefectTableItem) => void,
  onAddComment: (defect: DefectTableItem) => void,
  showActions: boolean = true,
): Array<ColumnDef<DefectTableItem>> {
  const columns: Array<ColumnDef<DefectTableItem>> = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <NameCell row={row} />,
    },
    {
      accessorKey: 'module',
      header: 'Module',
      cell: ({ row }) => <ModuleCell row={row} />,
    },
    {
      accessorKey: 'defectType',
      header: 'Type',
      cell: ({ row }) => <DefectTypeCell row={row} />,
    },
    {
      accessorKey: 'severity',
      header: 'Severity',
      cell: ({ row }) => <SeverityCell row={row} />,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusCell row={row} />,
    },
    {
      accessorKey: 'assignedTo',
      header: 'Assigned To',
      cell: ({ row }) => <AssignedToCell row={row} />,
    },
    {
      accessorKey: 'reporterId',
      header: 'Reporter',
      cell: ({ row }) => <ReporterCell row={row} />,
    },
    {
      accessorKey: 'flags',
      header: 'Flags',
      cell: ({ row }) => <FlagsCell row={row} />,
    },
    {
      accessorKey: '_creationTime',
      header: 'Created',
      cell: ({ row }) => <CreatedDateCell row={row} />,
    },
  ]

  if (showActions) {
    columns.push({
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <ActionsCell
          row={row}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddComment={onAddComment}
        />
      ),
      enableSorting: false,
    })
  }

  return columns
}
