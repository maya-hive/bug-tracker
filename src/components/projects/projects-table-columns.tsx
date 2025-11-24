import { Pencil, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import type { ProjectTableItem } from './projects-table.types'
import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '~/components/ui/button'

function NameCell({ row }: { row: { original: ProjectTableItem } }) {
  return <div className="font-medium">{row.original.name}</div>
}

function CreatedDateCell({ row }: { row: { original: ProjectTableItem } }) {
  return (
    <div className="text-muted-foreground text-sm text-right">
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
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <NameCell row={row} />,
      enableHiding: false,
    },
    {
      accessorKey: '_creationTime',
      header: () => <div className="text-right">Created</div>,
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
