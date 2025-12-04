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
import { DEFECT_SEVERITIES } from 'convex/defects'
import type { DefectStatus } from 'convex/defects'
import type { DefectTableItem } from './defects-table.types'
import type { Id } from 'convex/_generated/dataModel'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { ImageLightbox } from '~/components/ui/image-lightbox'
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
  getStatusIcon,
  getStatusIconColor,
  getStatusLabel,
  getStatusOptionsForSelect,
} from '~/components/defects/defect-status'

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

  const StatusIcon = getStatusIcon(defect.status)
  const statusIconColor = getStatusIconColor(defect.status)

  return (
    <>
      <Card className="flex flex-col h-full gap-2 rounded-md shadow-none">
        <CardHeader className="pb-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0 space-y-1.5">
              <CardTitle className="text-md font-semibold leading-tight line-clamp-2">
                {defect.name}
              </CardTitle>
            </div>
            <Select
              value={defect.status}
              onValueChange={handleStatusChange}
              disabled={statusUpdating}
            >
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <StatusIcon className={cn('size-4', statusIconColor)} />
                  <SelectValue>{getStatusLabel(defect.status)}</SelectValue>
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
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="default" className="gap-1.5">
              <AlertCircle className="size-3" />
              {defect.type}
            </Badge>
            <Badge
              variant={
                DEFECT_SEVERITIES.find((s) => s.value === defect.severity)
                  ?.color
              }
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
                  className="h-56 w-full rounded-sm object-cover"
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
                      className="text-sm py-2 px-3 rounded-sm bg-muted/50 border border-border/50 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-xs">
                          {getUserName(comment.authorId)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(comment.timestamp), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed">{comment.text}</p>
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
              className="mt-2 w-full h-10"
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
