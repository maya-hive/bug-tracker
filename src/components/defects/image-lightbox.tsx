import { useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { Dialog, DialogContent } from '~/components/ui/dialog'

export function ImageLightbox({
  storageId,
  open,
  onOpenChange,
}: {
  storageId: Id<'_storage'> | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const imageUrl = useQuery(
    api.defects.getFileUrl,
    storageId ? { storageId } : 'skip',
  )

  if (!storageId || !imageUrl) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={imageUrl}
            alt="Defect attachment"
            className="max-w-full max-h-[95vh] object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
