import { Pencil, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import type { UserTableItem } from './users-table.types'
import type { ColumnDef, Table as TanstackTable } from '@tanstack/react-table'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'

function SelectCell({ table }: { table: TanstackTable<UserTableItem> }) {
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

function NameCell({ row }: { row: { original: UserTableItem } }) {
  return (
    <div className="font-medium">
      {row.original.name ? (
        row.original.name
      ) : (
        <span className="text-muted-foreground">No name</span>
      )}
    </div>
  )
}

function EmailCell({ row }: { row: { original: UserTableItem } }) {
  return <div className="text-muted-foreground">{row.original.email}</div>
}

function CreatedDateCell({ row }: { row: { original: UserTableItem } }) {
  return (
    <div className="text-muted-foreground text-sm">
      {format(new Date(row.original._creationTime), 'MMM d, yyyy')}
    </div>
  )
}

function UpdatedDateCell({ row }: { row: { original: UserTableItem } }) {
  // Note: Convex doesn't have _updatedTime by default
  // We'll use _creationTime as a placeholder, or you can add an updatedAt field
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
  row: { original: UserTableItem }
  onEdit: (user: UserTableItem) => void
  onDelete: (user: UserTableItem) => void
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        onClick={() => onEdit(row.original)}
        aria-label="Edit user"
      >
        <Pencil className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={() => onDelete(row.original)}
        aria-label="Delete user"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  )
}

export function createColumns(
  onEdit: (user: UserTableItem) => void,
  onDelete: (user: UserTableItem) => void,
): Array<ColumnDef<UserTableItem>> {
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
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => <EmailCell row={row} />,
    },
    {
      accessorKey: '_creationTime',
      header: 'Created',
      cell: ({ row }) => <CreatedDateCell row={row} />,
    },
    {
      id: 'updated',
      header: 'Updated',
      cell: ({ row }) => <UpdatedDateCell row={row} />,
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
