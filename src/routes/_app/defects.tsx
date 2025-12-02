import { Suspense, useEffect, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import { toast } from 'sonner'
import { CirclePlus, LayoutGrid, Table } from 'lucide-react'
import type { DefectTableItem } from '~/components/defects/defects-table.types'
import type { Id } from 'convex/_generated/dataModel'
import type { DefectsFilters as DefectsFiltersType } from '~/components/defects/defects-filters'
import { DefectsTable } from '~/components/defects/defects-table'
import { createDefectsColumns } from '~/components/defects/defects-table-columns'
import { EditDefectDialog } from '~/components/defects/edit-defect-dialog'
import { CreateDefectDialog } from '~/components/defects/create-defect-dialog'
import { AddCommentDialog } from '~/components/defects/add-comment-dialog'
import { DefectsFilters } from '~/components/defects/defects-filters'
import { useProject } from '~/hooks/use-project'
import { Button } from '~/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle-group'
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

const DEFECTS_VIEW_MODE_KEY = 'defects-view-mode'

function Defects() {
  const defects = useQuery(api.defects.listDefects)
  const users = useQuery(api.users.listUsers)
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
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(DEFECTS_VIEW_MODE_KEY)
      if (saved === 'table' || saved === 'cards') {
        return saved
      }
    }
    return 'cards'
  })

  const [filters, setFilters] = useState<DefectsFiltersType>({
    severity: null,
    type: null,
    priority: null,
    assignedTo: null,
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DEFECTS_VIEW_MODE_KEY, viewMode)
    }
  }, [viewMode])

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
        type: defect.type,
        description: defect.description,
        screenshot: defect.screenshot,
        assignedTo: defect.assignedTo,
        assignedToName: defect.assignedToName,
        reporterId: defect.reporterId,
        reporterName: defect.reporterName,
        severity: defect.severity,
        priority: defect.priority,
        status: defect.status,
        comments: defect.comments,
      }))
      .filter((defect) => {
        if (projectId !== null && defect.projectId !== projectId) {
          return false
        }

        if (filters.severity !== null && defect.severity !== filters.severity) {
          return false
        }

        if (filters.type !== null && defect.type !== filters.type) {
          return false
        }

        if (filters.priority !== null && defect.priority !== filters.priority) {
          return false
        }

        if (filters.assignedTo !== null) {
          if (defect.assignedTo !== filters.assignedTo) {
            return false
          }
        }

        return true
      })
  }, [defects, projectId, filters])

  const columns = useMemo(
    () => createDefectsColumns(handleEdit, handleDelete),
    [handleEdit, handleDelete, handleAddComment],
  )

  if (defects === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading defects...</div>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="shrink-0">
            <h1 className="text-2xl font-semibold">Defects</h1>
            <p className="text-muted-foreground">
              Manage defects assigned to the project
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <DefectsFilters
              filters={filters}
              users={users}
              onFiltersChange={setFilters}
            />
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) => {
                if (value === 'table' || value === 'cards') {
                  setViewMode(value)
                }
              }}
              variant="outline"
            >
              <ToggleGroupItem value="cards" aria-label="Card view">
                <LayoutGrid className="size-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="table" aria-label="Table view">
                <Table className="size-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            <Button onClick={() => setCreateDefectOpen(true)}>
              <CirclePlus className="size-4" />
              Create New Defect
            </Button>
          </div>
        </div>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <DefectsTable
          data={defectsData}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddComment={handleAddComment}
          viewMode={viewMode}
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
