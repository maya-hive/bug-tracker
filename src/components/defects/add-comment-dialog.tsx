import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { useMutation } from 'convex/react'
import { api } from 'convex/_generated/api'
import { toast } from 'sonner'
import type { Id } from 'convex/_generated/dataModel'
import type { DefectTableItem } from './defects-table.types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'

const addCommentSchema = z.object({
  text: z.string().min(1, 'Comment is required'),
})

type AddCommentFormValues = z.infer<typeof addCommentSchema>

export function AddCommentDialog({
  defect,
  open,
  onOpenChange,
}: {
  defect: DefectTableItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const addComment = useMutation(api.defects.addComment)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<AddCommentFormValues>({
    resolver: zodResolver(addCommentSchema),
    defaultValues: {
      text: '',
    },
  })

  const onSubmit = async (values: AddCommentFormValues) => {
    if (!defect) return

    setIsSubmitting(true)
    try {
      await addComment({
        defectId: defect._id as Id<'defects'>,
        text: values.text,
      })

      toast.success('Comment added successfully')
      onOpenChange(false)
      form.reset()
    } catch (error) {
      toast.error('Failed to add comment')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!defect) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Comment</DialogTitle>
          <DialogDescription>
            Add a comment to defect: {defect.name}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comment</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your comment..."
                      className="min-h-[120px]"
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
                onClick={() => {
                  onOpenChange(false)
                  form.reset()
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Comment'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

