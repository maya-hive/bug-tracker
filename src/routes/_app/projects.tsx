import { Suspense, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import { toast } from 'sonner'
import { CirclePlus } from 'lucide-react'
import { VALID_ROLES } from 'convex/lib/permissions'
import type { Role } from 'convex/lib/permissions'
import type { ProjectTableItem } from '~/components/projects/projects-table.types'
import type { Id } from 'convex/_generated/dataModel'
import { ProjectsTable } from '~/components/projects/projects-table'
import { EditProjectDialog } from '~/components/projects/edit-project-dialog'
import { CreateProjectDialog } from '~/components/projects/create-project-dialog'
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
import { useAuthUser } from '~/contexts/use-auth-user'

export const Route = createFileRoute('/_app/projects')({
  component: Projects,
})

function Projects() {
  const authUser = useAuthUser()
  const navigate = useNavigate()

  if (
    !(
      [VALID_ROLES.MANAGER, VALID_ROLES.TESTER] as ReadonlyArray<Role>
    ).includes(authUser.role)
  ) {
    return navigate({ to: '/dashboard', replace: true })
  }

  const projects = useQuery(api.projects.listProjects)
  const deleteProject = useMutation(api.projects.deleteProject)
  const [editingProject, setEditingProject] = useState<ProjectTableItem | null>(
    null,
  )
  const [deletingProject, setDeletingProject] =
    useState<ProjectTableItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [createProjectOpen, setCreateProjectOpen] = useState(false)

  const handleEdit = (project: ProjectTableItem) => {
    setEditingProject(project)
  }

  const handleDelete = (project: ProjectTableItem) => {
    setDeletingProject(project)
  }

  const confirmDelete = async () => {
    if (!deletingProject) return

    setIsDeleting(true)
    try {
      await deleteProject({ projectId: deletingProject._id as Id<'projects'> })
      toast.success('Project deleted successfully')
      setDeletingProject(null)
    } catch (error) {
      toast.error('Failed to delete project')
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (projects === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading projects...</div>
      </div>
    )
  }

  const projectsData: Array<ProjectTableItem> = projects.map((project) => ({
    _id: project._id,
    _creationTime: project._creationTime,
    name: project.name,
  }))

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Projects</h1>
            <p className="text-muted-foreground">Manage projects</p>
          </div>
          <Button onClick={() => setCreateProjectOpen(true)}>
            <CirclePlus className="size-4" />
            Create New Project
          </Button>
        </div>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <ProjectsTable
          data={projectsData}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Suspense>
      <CreateProjectDialog
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
      />
      <EditProjectDialog
        project={editingProject}
        open={!!editingProject}
        onOpenChange={(open) => !open && setEditingProject(null)}
      />
      <AlertDialog
        open={!!deletingProject}
        onOpenChange={(open) => !open && setDeletingProject(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              project {deletingProject?.name}.
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
