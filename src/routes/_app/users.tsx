import { Suspense, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import { toast } from 'sonner'
import { CirclePlus } from 'lucide-react'
import type { UserTableItem } from '~/components/users/users-table.types'
import type { Id } from 'convex/_generated/dataModel'
import { UsersTable } from '~/components/users/users-table'
import { EditUserDialog } from '~/components/users/edit-user-dialog'
import { CreateUserDialog } from '~/components/users/create-user-dialog'
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

export const Route = createFileRoute('/_app/users')({
  component: Users,
})

function Users() {
  const users = useQuery(api.users.listUsers)
  const deleteUser = useMutation(api.users.deleteUser)
  const [editingUser, setEditingUser] = useState<UserTableItem | null>(null)
  const [deletingUser, setDeletingUser] = useState<UserTableItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [createUserOpen, setCreateUserOpen] = useState(false)

  const handleEdit = (user: UserTableItem) => {
    setEditingUser(user)
  }

  const handleDelete = (user: UserTableItem) => {
    setDeletingUser(user)
  }

  const confirmDelete = async () => {
    if (!deletingUser) return

    setIsDeleting(true)
    try {
      await deleteUser({ userId: deletingUser._id as Id<'users'> })
      toast.success('User deleted successfully')
      setDeletingUser(null)
    } catch (error) {
      toast.error('Failed to delete user')
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (users === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading users...</div>
      </div>
    )
  }

  const usersData: Array<UserTableItem> = users.map((user) => ({
    _id: user._id,
    _creationTime: user._creationTime,
    name: user.name,
    email: user.email as string,
  }))

  return (
    <>
      <div className="mb-6 px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Users</h1>
            <p className="text-muted-foreground">
              Manage users and their permissions
            </p>
          </div>
          <Button onClick={() => setCreateUserOpen(true)}>
            <CirclePlus className="size-4" />
            Create New User
          </Button>
        </div>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <UsersTable
          data={usersData}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Suspense>
      <CreateUserDialog
        open={createUserOpen}
        onOpenChange={setCreateUserOpen}
      />
      <EditUserDialog
        user={editingUser}
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
      />
      <AlertDialog
        open={!!deletingUser}
        onOpenChange={(open) => !open && setDeletingUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user account for {deletingUser?.email}.
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
