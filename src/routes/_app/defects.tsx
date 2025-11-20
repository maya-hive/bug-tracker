import { Suspense, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import { toast } from 'sonner'
import { CirclePlus } from 'lucide-react'
import { DefectsTable } from '../../components/defects/defects-table'
import { EditDefectDialog } from '../../components/defects/edit-defect-dialog'
import { CreateDefectDialog } from '../../components/defects/create-defect-dialog'
import { AddCommentDialog } from '../../components/defects/add-comment-dialog'
import type { DefectTableItem } from '../../components/defects/defects-table.types'
import type { Id } from 'convex/_generated/dataModel'
import { useProject } from '~/hooks/use-project'
import { Button } from '~/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'

export const Route = createFileRoute('/_app/defects')({
  component: Defects,
})

function Defects() {
  const defects = useQuery(api.defects.listDefects)
  const [projectId] = useProject()
  const deleteDefect = useMutation(api.defects.deleteDefect)
  const [editingDefect, setEditingDefect] = useState<DefectTableItem | null>(
    null,
  )
  const [deletingDefect, setDeletingDefect] = useState<DefectTableItem | null>(
    null,
  )
  const [commentingDefect, setCommentingDefect] =
    useState<DefectTableItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [createDefectOpen, setCreateDefectOpen] = useState(false)

  const handleEdit = (defect: DefectTableItem) => {
    setEditingDefect(defect)
  }

  const handleDelete = (defect: DefectTableItem) => {
    setDeletingDefect(defect)
  }

  const handleAddComment = (defect: DefectTableItem) => {
    setCommentingDefect(defect)
  }

  const confirmDelete = async () => {
    if (!deletingDefect) return

    setIsDeleting(true)
    try {
      await deleteDefect({ defectId: deletingDefect._id as Id<'defects'> })
      toast.success('Defect deleted successfully')
      setDeletingDefect(null)
    } catch (error) {
      toast.error('Failed to delete defect')
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  const defectsData: Array<DefectTableItem> = useMemo(() => {
    if (defects === undefined) {
      return []
    }

    return defects
      .map((defect) => ({
        _id: defect._id,
        _creationTime: defect._creationTime,
        projectId: defect.projectId,
        projectName: defect.projectName,
        name: defect.name,
        module: defect.module,
        defectType: defect.defectType,
        description: defect.description,
        screenshot: defect.screenshot,
        assignedTo: defect.assignedTo,
        assignedToName: defect.assignedToName,
        reporterId: defect.reporterId,
        reporterName: defect.reporterName,
        severity: defect.severity,
        flags: defect.flags,
        status: defect.status,
        comments: defect.comments,
      }))
      .filter((defect) => {
        // If projectId is null (All Projects), show all defects
        if (projectId === null) {
          return true
        }
        // Otherwise, filter by projectId
        return defect.projectId === projectId
      })
  }, [defects, projectId])

  if (defects === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading defects...</div>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6 px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Defects</h1>
            <p className="text-muted-foreground">
              Manage defects and track their status
            </p>
          </div>
          <Button onClick={() => setCreateDefectOpen(true)}>
            <CirclePlus className="size-4" />
            Create New Defect
          </Button>
        </div>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <DefectsTable
          data={defectsData}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddComment={handleAddComment}
          viewMode="cards"
        />
      </Suspense>
      <CreateDefectDialog
        open={createDefectOpen}
        onOpenChange={setCreateDefectOpen}
      />
      <EditDefectDialog
        defect={editingDefect}
        open={!!editingDefect}
        onOpenChange={(open) => !open && setEditingDefect(null)}
      />
      <AddCommentDialog
        defect={commentingDefect}
        open={!!commentingDefect}
        onOpenChange={(open) => !open && setCommentingDefect(null)}
      />
      <AlertDialog
        open={!!deletingDefect}
        onOpenChange={(open) => !open && setDeletingDefect(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              defect {deletingDefect?.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
