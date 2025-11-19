import { Pencil, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import type { ProjectTableItem } from './projects-table.types'
import type { ColumnDef, Table as TanstackTable } from '@tanstack/react-table'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Badge } from '~/components/ui/badge'

function SelectCell({ table }: { table: TanstackTable<ProjectTableItem> }) {
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

function NameCell({ row }: { row: { original: ProjectTableItem } }) {
  return <div className="font-medium">{row.original.name}</div>
}

function EnvironmentCell({ row }: { row: { original: ProjectTableItem } }) {
  const envColors = {
    live: 'destructive',
    staging: 'default',
    dev: 'secondary',
  } as const

  return (
    <Badge variant={envColors[row.original.environment]}>
      {row.original.environment}
    </Badge>
  )
}

function CreatedDateCell({ row }: { row: { original: ProjectTableItem } }) {
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
  row: { original: ProjectTableItem }
  onEdit: (project: ProjectTableItem) => void
  onDelete: (project: ProjectTableItem) => void
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        onClick={() => onEdit(row.original)}
        aria-label="Edit project"
      >
        <Pencil className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={() => onDelete(row.original)}
        aria-label="Delete project"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  )
}

export function createColumns(
  onEdit: (project: ProjectTableItem) => void,
  onDelete: (project: ProjectTableItem) => void,
): Array<ColumnDef<ProjectTableItem>> {
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
      accessorKey: 'environment',
      header: 'Environment',
      cell: ({ row }) => <EnvironmentCell row={row} />,
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
