import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import { toast } from 'sonner'
import {
  Activity,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Tag,
  UserCheck,
  UserRoundPen,
} from 'lucide-react'
import { format } from 'date-fns'
import { ImageLightbox } from './image-lightbox'
import type { DefectTableItem } from './defects-table.types'
import type { Id } from 'convex/_generated/dataModel'
import type { DefectStatus } from 'convex/lib/validators'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
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
import { cn } from '~/lib/utils'
import { ImageZoom } from '~/components/ui/image-zoom'
import { Skeleton } from '~/components/ui/skeleton'
import {
  getStatusLabel,
  getStatusOptionsForSelect,
} from '~/types/defect-status'

const severityColors = {
  blocker: 'destructive',
  critical: 'destructive',
  major: 'destructive',
  medium: 'default',
  minor: 'secondary',
} as const

export function DefectCard({
  defect,
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

  const statusOptions = getStatusOptionsForSelect()

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
        status: newStatus as DefectStatus,
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
    const foundUser = users?.find((u) => u._id === userId)
    return foundUser?.name || foundUser?.email || 'Unknown User'
  }

  const comments = defect.comments || []
  const commentsCount = comments.length

  return (
    <>
      <Card className="flex flex-col h-full gap-2">
        <CardHeader className="pb-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0 space-y-1.5">
              <CardTitle className="text-lg font-semibold leading-tight line-clamp-2">
                {defect.name}
              </CardTitle>
            </div>
            <Select
              value={defect.status}
              onValueChange={handleStatusChange}
              disabled={statusUpdating}
            >
              <SelectTrigger>
                <SelectValue>{getStatusLabel(defect.status)}</SelectValue>
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

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="default" className="gap-1.5">
              <AlertCircle className="size-3" />
              {defect.type}
            </Badge>
            <Badge
              variant={severityColors[defect.severity]}
              className="gap-1.5"
            >
              <Activity className="size-3" />
              {defect.severity}
            </Badge>
            <Badge variant="outline" className="text-xs gap-1.5">
              <Tag className="size-3" />
              {defect.priority}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-4 pt-0">
          <div className="space-y-1.5">
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {defect.description}
            </p>
          </div>

          {(defect.reporterName || defect.assignedToName) && (
            <div className="flex items-center gap-4">
              {defect.reporterName && (
                <div className="flex items-center gap-2 text-sm flex-1 min-w-0">
                  <div className="flex items-center justify-center size-7 rounded-md bg-muted/50 border border-border/50 shrink-0">
                    <UserCheck className="size-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground">
                      Reported by
                    </div>
                    <div className="font-medium truncate text-sm">
                      {defect.reporterName}
                    </div>
                  </div>
                </div>
              )}

              {defect.assignedToName && (
                <div className="flex items-center gap-2 text-sm flex-1 min-w-0">
                  <div className="flex items-center justify-center size-7 rounded-md bg-muted/50 border border-border/50 shrink-0">
                    <UserRoundPen className="size-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground">
                      Assigned to
                    </div>
                    <div className="font-medium truncate text-sm">
                      {defect.assignedToName}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            {defect.screenshot && imageUrl ? (
              <ImageZoom
                zoomMargin={100}
                backdropClassName={cn(
                  '[&_[data-rmiz-modal-overlay="visible"]]:bg-black/80',
                )}
              >
                <img
                  className="h-56 w-full rounded-sm"
                  src={imageUrl}
                  loading="lazy"
                />
              </ImageZoom>
            ) : (
              <Skeleton className="h-56 w-full rounded-sm" />
            )}
          </div>

          <div className="mt-auto space-y-2 pt-2 border-t border-border/50">
            {commentsCount > 0 && (
              <Collapsible
                open={commentsExpanded}
                onOpenChange={setCommentsExpanded}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between text-sm h-9"
                  >
                    <span className="flex items-center gap-2">
                      <MessageSquare className="size-4" />
                      <span>
                        {commentsCount} comment{commentsCount > 1 ? 's' : ''}
                      </span>
                    </span>
                    {commentsExpanded ? (
                      <ChevronUp className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2.5 pt-2">
                  {comments.slice(0, 3).map((comment, index) => (
                    <div
                      key={index}
                      className="text-sm p-3 rounded-lg bg-muted/50 border border-border/50 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-xs">
                          {getUserName(comment.authorId)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(comment.timestamp), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{comment.text}</p>
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
              className="w-full h-9"
              onClick={() => onAddComment(defect)}
            >
              <MessageSquare className="size-4" />
              Add Comment
            </Button>
          </div>
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
