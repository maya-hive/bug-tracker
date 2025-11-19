import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { useMutation } from 'convex/react'
import { api } from 'convex/_generated/api'
import { toast } from 'sonner'
import type { Id } from 'convex/_generated/dataModel'
import type { UserTableItem } from './datatable/users-table.types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'

const editUserSchema = z.object({
  name: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email address'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .optional()
    .or(z.literal('')),
})

type EditUserFormValues = z.infer<typeof editUserSchema>

export function EditUserDialog({
  user,
  open,
  onOpenChange,
}: {
  user: UserTableItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const updateUser = useMutation(api.users.updateUser)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: '',
      email: '',
      newPassword: '',
    },
  })

  // Reset form when user changes
  useEffect(() => {
    if (user && open) {
      form.reset({
        name: user.name || '',
        email: user.email,
        newPassword: '',
      })
    }
  }, [user, open, form])

  const onSubmit = async (values: EditUserFormValues) => {
    if (!user) return

    setIsSubmitting(true)
    try {
      await updateUser({
        userId: user._id as Id<'users'>,
        name: values.name || undefined,
        email: values.email,
      })

      // Note: Password change is not implemented in the mutation yet
      // You'll need to implement it separately or through the auth API
      if (values.newPassword) {
        toast.info(
          'Password change is not yet implemented. Please use the auth API.',
        )
      }

      toast.success('User updated successfully')
      onOpenChange(false)
      form.reset()
    } catch (error) {
      toast.error('Failed to update user')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information. Leave password empty to keep current
            password.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Leave empty to keep current password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
