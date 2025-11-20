import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import { toast } from 'sonner'
import { ChevronDown, ChevronUp, MessageSquare, Pencil } from 'lucide-react'
import { format } from 'date-fns'
import { ImageLightbox } from './image-lightbox'
import type { DefectTableItem } from './defects-table.types'
import type { Id } from 'convex/_generated/dataModel'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible'

const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'fixed', label: 'Fixed' },
  { value: 'verified', label: 'Verified' },
  { value: 'reopened', label: 'Reopened' },
  { value: 'deferred', label: 'Deferred' },
] as const

const severityColors = {
  critical: 'destructive',
  high: 'destructive',
  medium: 'default',
  cosmetic: 'secondary',
} as const

export function DefectCard({
  defect,
  onEdit,
  onAddComment,
}: {
  defect: DefectTableItem
  onEdit: (defect: DefectTableItem) => void
  onAddComment: (defect: DefectTableItem) => void
}) {
  const updateDefect = useMutation(api.defects.updateDefect)
  const users = useQuery(api.users.listUsers)
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [commentsExpanded, setCommentsExpanded] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const imageUrl = useQuery(
    api.defects.getFileUrl,
    defect.screenshot
      ? { storageId: defect.screenshot as Id<'_storage'> }
      : 'skip',
  )

  const handleStatusChange = async (newStatus: string) => {
    setStatusUpdating(true)
    try {
      await updateDefect({
        defectId: defect._id as Id<'defects'>,
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

  const getUserName = (userId: string) => {
    const user = users?.find((u) => u._id === userId)
    return user?.name || user?.email || 'Unknown User'
  }

  const comments = defect.comments || []
  const commentsCount = comments.length

  return (
    <>
      <Card className="flex flex-col h-full gap-2">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold line-clamp-2">
                {defect.name}
              </CardTitle>
              <CardDescription className="mt-1 text-sm">
                {defect.projectName} • {defect.module}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0"
              onClick={() => onEdit(defect)}
              aria-label="Edit defect"
            >
              <Pencil className="size-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant={defect.defectType === 'bug' ? 'destructive' : 'default'}
            >
              {defect.defectType}
            </Badge>
            <Badge variant={severityColors[defect.severity]}>
              {defect.severity}
            </Badge>
            {defect.flags.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {defect.flags.length} flag{defect.flags.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground line-clamp-3">
            {defect.description}
          </p>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            <Select
              value={defect.status}
              onValueChange={handleStatusChange}
              disabled={statusUpdating}
            >
              <SelectTrigger className="w-[140px]">
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
          </div>

          {defect.reporterName && (
            <div className="text-sm text-muted-foreground">
              Reported by:{' '}
              <span className="font-medium">{defect.reporterName}</span>
            </div>
          )}

          {defect.assignedToName && (
            <div className="text-sm text-muted-foreground">
              Assigned to:{' '}
              <span className="font-medium">{defect.assignedToName}</span>
            </div>
          )}

          {defect.screenshot && imageUrl && (
            <div className="w-full">
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="w-full rounded-md overflow-hidden border hover:opacity-90 transition-opacity"
              >
                <img
                  src={imageUrl}
                  alt="Defect attachment"
                  className="w-full h-auto max-h-48 object-cover"
                />
              </button>
            </div>
          )}

          {commentsCount > 0 && (
            <Collapsible
              open={commentsExpanded}
              onOpenChange={setCommentsExpanded}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between text-sm"
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare className="size-4" />
                    {commentsCount} comment{commentsCount > 1 ? 's' : ''}
                  </span>
                  {commentsExpanded ? (
                    <ChevronUp className="size-4" />
                  ) : (
                    <ChevronDown className="size-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 pt-2">
                {comments.slice(0, 3).map((comment, index) => (
                  <div
                    key={index}
                    className="text-sm p-2 rounded-md bg-muted/50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-xs">
                        {getUserName(comment.authorId)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(comment.timestamp), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <p className="text-sm">{comment.text}</p>
                  </div>
                ))}
                {commentsCount > 3 && (
                  <p className="text-xs text-muted-foreground text-center pt-1">
                    +{commentsCount - 3} more comment
                    {commentsCount - 3 > 1 ? 's' : ''}
                  </p>
                )}
              </CollapsibleContent>
            </Collapsible>
          )}

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onAddComment(defect)}
          >
            <MessageSquare className="size-4 mr-2" />
            Add Comment
          </Button>
        </CardContent>
      </Card>

      {defect.screenshot && (
        <ImageLightbox
          storageId={defect.screenshot as Id<'_storage'>}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
        />
      )}
    </>
  )
}
