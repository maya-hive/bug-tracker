import { Activity, AlertCircle, Clock, Link, Pencil, Tag, Trash2, UserCheck, UserRoundPen } from 'lucide-react'
import { format } from 'date-fns'
import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { ImageZoom } from '~/components/ui/image-zoom'
import {
  getStatusIcon,
  getStatusIconColor,
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
      <Link className="size-4" />
    </Button>
  )
}

function DefectViewDialog({
  defect,
  open,
  onOpenChange,
}: {
  defect: DefectTableItem
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const imageUrl = useQuery(
    api.defects.getFileUrl,
    defect.screenshot
      ? { storageId: defect.screenshot as Id<'_storage'> }
      : 'skip',
  )

  const StatusIcon = getStatusIcon(defect.status.value as any)
  const statusIconColor = getStatusIconColor(defect.status.value as any)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-0">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl pr-8">{defect.name}</DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[calc(85vh-8rem)] pr-2 -mr-2">
          <div className="space-y-6">
            <div className="flex items-start gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="text-xs text-muted-foreground mb-1">Status</div>
                <Badge variant="outline" className="text-sm gap-2">
                  <StatusIcon className={cn('size-4', statusIconColor)} />
                  {defect.status.label}
                </Badge>
              </div>
              <div className="flex-1 min-w-[200px]">
                <div className="text-xs text-muted-foreground mb-1">Project</div>
                <div className="text-sm font-medium">{defect.projectName}</div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-xs text-muted-foreground mb-2">Types</div>
                <div className="flex flex-wrap gap-2">
                  {defect.types.length === 0 ? (
                    <span className="text-sm text-muted-foreground">No types assigned</span>
                  ) : (
                    defect.types.map((type) => (
                      <Badge key={type._id} variant="default" className="gap-1.5">
                        <AlertCircle className="size-3" />
                        {type.label}
                      </Badge>
                    ))
                  )}
                </div>
              </div>
              
              <div className="flex gap-4 flex-wrap">
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Severity</div>
                  <Badge variant={defect.severity.color as any} className="gap-1.5">
                    <Activity className="size-3" />
                    {defect.severity.label}
                  </Badge>
                </div>
                
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Priority</div>
                  <Badge variant={defect.priority.color as any} className="gap-1.5">
                    <Tag className="size-3" />
                    {defect.priority.label}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground mb-2">Description</div>
              <div className="text-sm leading-relaxed whitespace-pre-wrap p-3 rounded-md bg-muted/30 border border-border/50">
                {defect.description}
              </div>
            </div>

            <div className="flex gap-4 flex-wrap">
              {defect.reporterName && (
                <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                  <div className="flex items-center justify-center size-9 rounded-md bg-muted/50 border border-border/50 shrink-0">
                    <UserCheck className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Reported by</div>
                    <div className="font-medium text-sm">{defect.reporterName}</div>
                  </div>
                </div>
              )}
              
              {defect.assignedToName && (
                <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                  <div className="flex items-center justify-center size-9 rounded-md bg-muted/50 border border-border/50 shrink-0">
                    <UserRoundPen className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Assigned to</div>
                    <div className="font-medium text-sm">{defect.assignedToName}</div>
                  </div>
                </div>
              )}
            </div>

            {defect.screenshot && imageUrl && (
              <div>
                <div className="text-xs text-muted-foreground mb-2">Screenshot</div>
                <ImageZoom
                  zoomMargin={100}
                  backdropClassName={cn(
                    '[&_[data-rmiz-modal-overlay="visible"]]:bg-black/80',
                  )}
                >
                  <img
                    className="w-full rounded-md object-cover max-h-96 border border-border/50"
                    src={imageUrl}
                    loading="lazy"
                    alt="Defect screenshot"
                  />
                </ImageZoom>
              </div>
            )}

            <div className="flex gap-4 flex-wrap text-xs text-muted-foreground pt-2 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Clock className="size-3.5" />
                <span>Created: {format(new Date(defect._creationTime), 'MMM d, yyyy h:mm a')}</span>
              </div>
              {defect.updatedAt && (
                <div className="flex items-center gap-2">
                  <Clock className="size-3.5" />
                  <span>Updated: {format(new Date(defect.updatedAt), 'MMM d, yyyy h:mm a')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function NameCell({ row }: { row: { original: DefectTableItem } }) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setDialogOpen(true)}
        className="font-medium text-left hover:underline hover:text-primary transition-colors cursor-pointer"
      >
        {row.original.name}
      </button>
      <DefectViewDialog
        defect={row.original}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}

function SeverityCell({ row }: { row: { original: DefectTableItem } }) {
  return (
    <Badge variant={row.original.severity.color as any}>
      {row.original.severity.label}
    </Badge>
  )
}

function StatusCell({ row }: { row: { original: DefectTableItem } }) {
  const currentStatus = row.original.status
  const defectStatuses = useQuery(api.defects.getDefectStatuses)
  const updateDefect = useMutation(api.defects.updateDefect)
  const [statusUpdating, setStatusUpdating] = useState(false)

  const StatusIcon = getStatusIcon(currentStatus.value as any)
  const statusIconColor = getStatusIconColor(currentStatus.value as any)

  const handleStatusChange = async (newStatusId: string) => {
    setStatusUpdating(true)
    try {
      await updateDefect({
        defectId: row.original._id,
        status: newStatusId as Id<'defectStatuses'>,
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
      value={currentStatus._id}
      onValueChange={handleStatusChange}
      disabled={statusUpdating || !defectStatuses}
    >
      <SelectTrigger className="w-fit" size="sm">
        <div className="flex items-center gap-2">
          <StatusIcon className={cn('size-4', statusIconColor)} />
          <SelectValue>{currentStatus.label}</SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {defectStatuses?.map((status) => {
          const OptionIcon = getStatusIcon(status.value as any)
          const optionIconColor = getStatusIconColor(status.value as any)
          return (
            <SelectItem key={status._id} value={status._id}>
              <div className="flex items-center gap-2">
                <OptionIcon className={cn('size-4', optionIconColor)} />
                <span>{status.label}</span>
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
  const statusLabel = status.label
  const StatusIcon = getStatusIcon(status.value as any)
  const statusIconColor = getStatusIconColor(status.value as any)

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
  const types = row.original.types
  if (types.length === 0) {
    return <span className="text-muted-foreground text-sm">No types</span>
  }
  return (
    <div className="flex flex-wrap gap-1">
      {types.map((type) => {
        return (
          <Badge key={type._id} variant="default" className="text-xs">
            {type.label}
          </Badge>
        )
      })}
    </div>
  )
}

function PriorityCell({ row }: { row: { original: DefectTableItem } }) {
  return (
    <Badge variant={row.original.priority.color as any}>
      {row.original.priority.label}
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
      accessorKey: 'types',
      header: 'Types',
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
      header: 'Link',
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
      accessorKey: 'types',
      header: 'Types',
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
