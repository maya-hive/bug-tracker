import { Pencil, Trash2 } from 'lucide-react'
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
    low: 'secondary',
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
    'in-progress': 'secondary',
    resolved: 'default',
    closed: 'outline',
  } as const

  return (
    <Badge variant={statusColors[row.original.status]}>
      {row.original.status}
    </Badge>
  )
}

function AttachmentsCell({ row }: { row: { original: DefectTableItem } }) {
  const count = row.original.attachments.length
  return (
    <div className="text-muted-foreground text-sm">
      {count === 0 ? (
        <span>No attachments</span>
      ) : (
        <span>
          {count} {count === 1 ? 'file' : 'files'}
        </span>
      )}
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

export function createColumns(
  onEdit: (defect: DefectTableItem) => void,
  onDelete: (defect: DefectTableItem) => void,
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
      accessorKey: 'attachments',
      header: 'Attachments',
      cell: ({ row }) => <AttachmentsCell row={row} />,
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
        <ActionsCell row={row} onEdit={onEdit} onDelete={onDelete} />
      ),
      enableSorting: false,
    },
  ]
}
