import { Copy, Pencil, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from 'convex/_generated/api'
import { toast } from 'sonner'
import { DEFECT_PRIORITIES, DEFECT_SEVERITIES } from 'convex/defects'
import type { DefectStatus } from 'convex/defects'
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
import {
  getStatusIcon,
  getStatusIconColor,
  getStatusLabel,
  getStatusOptionsForSelect,
} from '~/components/defects/defect-status'
import { cn } from '~/lib/utils'

function IDCell({ row }: { row: { original: DefectTableItem } }) {
  const handleCopy = async () => {
    const url = window.location.href.split('?')[0]
    const link = `${url}?defect_id=${row.original._id}`

    try {
      await navigator.clipboard.writeText(link)
      toast.success('ID copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy ID')
      console.error(error)
    }
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleCopy}>
      <Copy className="size-4" />
    </Button>
  )
}

function NameCell({ row }: { row: { original: DefectTableItem } }) {
  return <div className="font-medium">{row.original.name}</div>
}

function SeverityCell({ row }: { row: { original: DefectTableItem } }) {
  return (
    <Badge
      variant={
        DEFECT_SEVERITIES.find((s) => s.value === row.original.severity)?.color
      }
    >
      {DEFECT_SEVERITIES.find((s) => s.value === row.original.severity)?.label}
    </Badge>
  )
}

function StatusCell({ row }: { row: { original: DefectTableItem } }) {
  const currentStatus = row.original.status
  const statusOptions = getStatusOptionsForSelect()
  const updateDefect = useMutation(api.defects.updateDefect)
  const [statusUpdating, setStatusUpdating] = useState(false)

  const StatusIcon = getStatusIcon(currentStatus)
  const statusIconColor = getStatusIconColor(currentStatus)

  const handleStatusChange = async (newStatus: DefectStatus) => {
    setStatusUpdating(true)
    try {
      await updateDefect({
        defectId: row.original._id,
        status: newStatus,
      })
      toast.success('Status updated successfully')
    } catch (error) {
      toast.error('Failed to update status')
      console.error(error)
    } finally {
      setStatusUpdating(false)
    }
  }

  return (
    <Select
      value={currentStatus}
      onValueChange={handleStatusChange}
      disabled={statusUpdating}
    >
      <SelectTrigger className="w-fit" size="sm">
        <div className="flex items-center gap-2">
          <StatusIcon className={cn('size-4', statusIconColor)} />
          <SelectValue>{getStatusLabel(currentStatus)}</SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => {
          const OptionIcon = getStatusIcon(option.value)
          const optionIconColor = getStatusIconColor(option.value)
          return (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <OptionIcon className={cn('size-4', optionIconColor)} />
                <span>{option.label}</span>
              </div>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}

function StatusCellReadOnly({ row }: { row: { original: DefectTableItem } }) {
  const status = row.original.status
  const statusLabel = getStatusLabel(status)
  const StatusIcon = getStatusIcon(status)
  const statusIconColor = getStatusIconColor(status)

  return (
    <Badge variant="outline" className="text-sm gap-1.5">
      <StatusIcon className={cn('size-3.5', statusIconColor)} />
      {statusLabel}
    </Badge>
  )
}

function ProjectCell({ row }: { row: { original: DefectTableItem } }) {
  return <div className="text-sm">{row.original.projectName}</div>
}

function TypeCell({ row }: { row: { original: DefectTableItem } }) {
  return <Badge variant="default">{row.original.type}</Badge>
}

function PriorityCell({ row }: { row: { original: DefectTableItem } }) {
  return (
    <Badge
      variant={
        DEFECT_PRIORITIES.find((p) => p.value === row.original.priority)?.color
      }
    >
      {DEFECT_PRIORITIES.find((p) => p.value === row.original.priority)?.label}
    </Badge>
  )
}

function AssignedToCell({ row }: { row: { original: DefectTableItem } }) {
  return (
    <div className="text-sm text-muted-foreground">
      {row.original.assignedToName || 'Unknown'}
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

function CreatedDateCell({ row }: { row: { original: DefectTableItem } }) {
  return (
    <div className="text-muted-foreground text-sm">
      {format(new Date(row.original._creationTime), 'MMM d, yyyy')}
    </div>
  )
}

function UpdatedDateCell({ row }: { row: { original: DefectTableItem } }) {
  if (!row.original.updatedAt) {
    return null
  }

  return (
    <div className="text-muted-foreground text-sm">
      {format(new Date(row.original.updatedAt), 'MMM d, yyyy')}
    </div>
  )
}

function ActionsCell({
  row,
  onEdit,
  onDelete,
}: {
  row: { original: DefectTableItem }
  onEdit: (defect: DefectTableItem) => void
  onDelete: (defect: DefectTableItem) => void
}) {
  return (
    <div className="flex items-center justify-end gap-2">
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
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => <TypeCell row={row} />,
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => <PriorityCell row={row} />,
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
      accessorKey: '_creationTime',
      header: 'Created',
      cell: ({ row }) => <CreatedDateCell row={row} />,
    },
  ]
}

export function createDefectsColumns(
  onEdit: (defect: DefectTableItem) => void,
  onDelete: (defect: DefectTableItem) => void,
  showActions: boolean = true,
): Array<ColumnDef<DefectTableItem>> {
  const columns: Array<ColumnDef<DefectTableItem>> = [
    {
      accessorKey: '_id',
      header: 'ID',
      cell: ({ row }) => <IDCell row={row} />,
    },
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
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => <TypeCell row={row} />,
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => <PriorityCell row={row} />,
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
      accessorKey: '_creationTime',
      header: 'Created',
      cell: ({ row }) => <CreatedDateCell row={row} />,
    },
    {
      accessorKey: 'updatedAt',
      header: 'Updated',
      cell: ({ row }) => <UpdatedDateCell row={row} />,
    },
  ]

  if (showActions) {
    columns.push({
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <ActionsCell row={row} onEdit={onEdit} onDelete={onDelete} />
      ),
      enableSorting: false,
    })
  }

  return columns
}
