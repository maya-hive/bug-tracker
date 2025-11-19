import { Suspense, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import { toast } from 'sonner'
import { DefectsTable } from './datatable/defects-table'
import { EditDefectDialog } from './edit-defect-dialog'
import type { DefectTableItem } from './datatable/defects-table.types'
import type { Id } from 'convex/_generated/dataModel'
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

export const Route = createFileRoute('/_app/defects/')({
  component: Defects,
})

function Defects() {
  const defects = useQuery(api.defects.listDefects)
  const deleteDefect = useMutation(api.defects.deleteDefect)
  const [editingDefect, setEditingDefect] = useState<DefectTableItem | null>(
    null,
  )
  const [deletingDefect, setDeletingDefect] = useState<DefectTableItem | null>(
    null,
  )
  const [isDeleting, setIsDeleting] = useState(false)

  const handleEdit = (defect: DefectTableItem) => {
    setEditingDefect(defect)
  }

  const handleDelete = (defect: DefectTableItem) => {
    setDeletingDefect(defect)
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

  if (defects === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading defects...</div>
      </div>
    )
  }

  const defectsData: Array<DefectTableItem> = defects.map((defect) => ({
    _id: defect._id,
    _creationTime: defect._creationTime,
    name: defect.name,
    description: defect.description,
    attachments: defect.attachments ?? [],
    severity: defect.severity,
    status: defect.status,
  }))

  return (
    <>
      <div className="mb-6 px-4 lg:px-6">
        <h1 className="text-2xl font-semibold">Defects</h1>
        <p className="text-muted-foreground">
          Manage defects and track their status
        </p>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <DefectsTable
          data={defectsData}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Suspense>
      <EditDefectDialog
        defect={editingDefect}
        open={!!editingDefect}
        onOpenChange={(open) => !open && setEditingDefect(null)}
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
