import { Pencil, Trash2, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'
import type { DefectTableItem } from './defects-table.types'
import type { ColumnDef, Table as TanstackTable } from '@tanstack/react-table'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Badge } from '~/components/ui/badge'

function SelectCell({ table }: { table: TanstackTable<DefectTableItem> }) {
  return (
    <div className="flex items-center justify-center">
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    </div>
  )
}

function SelectRowCell({
  row,
}: {
  row: {
    getIsSelected: () => boolean
    toggleSelected: (value: boolean) => void
  }
}) {
  return (
    <div className="flex items-center justify-center">
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    </div>
  )
}

function NameCell({ row }: { row: { original: DefectTableItem } }) {
  return <div className="font-medium">{row.original.name}</div>
}

function DescriptionCell({ row }: { row: { original: DefectTableItem } }) {
  return (
    <div className="text-muted-foreground max-w-md truncate">
      {row.original.description}
    </div>
  )
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

function StatusCell({ row }: { row: { original: DefectTableItem } }) {
  const statusColors = {
    open: 'default',
    fixed: 'secondary',
    verified: 'default',
    reopened: 'destructive',
    deferred: 'outline',
  } as const

  return (
    <Badge variant={statusColors[row.original.status]}>
      {row.original.status}
    </Badge>
  )
}

function ScreenshotCell({ row }: { row: { original: DefectTableItem } }) {
  const hasScreenshot = !!row.original.screenshot
  return (
    <div className="text-muted-foreground text-sm">
      {hasScreenshot ? <span>Has screenshot</span> : <span>No screenshot</span>}
    </div>
  )
}

function ProjectCell({ row }: { row: { original: DefectTableItem } }) {
  return (
    <div className="text-sm font-medium">{row.original.projectName}</div>
  )
}

function ModuleCell({ row }: { row: { original: DefectTableItem } }) {
  return (
    <div className="text-sm">{row.original.module}</div>
  )
}

function DefectTypeCell({ row }: { row: { original: DefectTableItem } }) {
  return (
    <Badge variant={row.original.defectType === 'bug' ? 'destructive' : 'default'}>
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
    <div className="text-sm text-muted-foreground">{row.original.reporterName}</div>
  )
}

function FlagsCell({ row }: { row: { original: DefectTableItem } }) {
  const flags = row.original.flags || []
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

function CommentsCell({ row }: { row: { original: DefectTableItem } }) {
  const count = row.original.comments?.length ?? 0
  return (
    <div className="text-sm text-muted-foreground">
      {count === 0 ? 'No comments' : `${count} comment${count === 1 ? '' : 's'}`}
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

export function createColumns(
  onEdit: (defect: DefectTableItem) => void,
  onDelete: (defect: DefectTableItem) => void,
  onAddComment: (defect: DefectTableItem) => void,
): Array<ColumnDef<DefectTableItem>> {
  return [
    {
      id: 'select',
      header: ({ table }) => <SelectCell table={table} />,
      cell: ({ row }) => <SelectRowCell row={row} />,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <NameCell row={row} />,
      enableHiding: false,
    },
    {
      accessorKey: 'projectId',
      header: 'Project',
      cell: ({ row }) => <ProjectCell row={row} />,
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
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => <DescriptionCell row={row} />,
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
      accessorKey: 'screenshot',
      header: 'Screenshot',
      cell: ({ row }) => <ScreenshotCell row={row} />,
    },
    {
      accessorKey: 'comments',
      header: 'Comments',
      cell: ({ row }) => <CommentsCell row={row} />,
    },
    {
      accessorKey: '_creationTime',
      header: 'Created',
      cell: ({ row }) => <CreatedDateCell row={row} />,
    },
    {
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
    },
  ]
}
