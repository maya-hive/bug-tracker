import { CheckCircle2, Loader2, MoreVertical } from 'lucide-react'
import { toast } from 'sonner'
import { TableCellViewer } from './dashboard-table-viewer'
import type { DataTableItem } from './dashboard-table.types'
import type { ColumnDef, Table as TanstackTable } from '@tanstack/react-table'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

function SelectCell({ table }: { table: TanstackTable<DataTableItem> }) {
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

function TypeCell({ row }: { row: { original: DataTableItem } }) {
  return (
    <div className="w-32">
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {row.original.type}
      </Badge>
    </div>
  )
}

function TargetCell({ row }: { row: { original: DataTableItem } }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
          loading: `Saving ${row.original.header}`,
          success: 'Done',
          error: 'Error',
        })
      }}
    >
      <Label htmlFor={`${row.original.id}-target`} className="sr-only">
        Target
      </Label>
      <Input
        className="hover:bg-input/30 focus-visible:bg-background dark:hover:bg-input/30 dark:focus-visible:bg-input/30 h-8 w-16 border-transparent bg-transparent text-right shadow-none focus-visible:border dark:bg-transparent"
        defaultValue={row.original.target}
        id={`${row.original.id}-target`}
      />
    </form>
  )
}

function StatusCell({ row }: { row: { original: DataTableItem } }) {
  return (
    <Badge variant="outline" className="text-muted-foreground px-1.5">
      {row.original.status === 'Done' ? (
        <CheckCircle2 className="fill-green-500 dark:fill-green-400" />
      ) : (
        <Loader2 />
      )}
      {row.original.status}
    </Badge>
  )
}

function ActionsCell() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
          size="icon"
        >
          <MoreVertical />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem>Make a copy</DropdownMenuItem>
        <DropdownMenuItem>Favorite</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const columns: Array<ColumnDef<DataTableItem>> = [
  {
    id: 'select',
    header: ({ table }) => <SelectCell table={table} />,
    cell: ({ row }) => <SelectRowCell row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'header',
    header: 'Header',
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />
    },
    enableHiding: false,
  },
  {
    accessorKey: 'type',
    header: 'Section Type',
    cell: ({ row }) => <TypeCell row={row} />,
  },
  {
    accessorKey: 'target',
    header: () => 'Target',
    cell: ({ row }) => <TargetCell row={row} />,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusCell row={row} />,
  },
  {
    id: 'actions',
    cell: () => <ActionsCell />,
  },
]
