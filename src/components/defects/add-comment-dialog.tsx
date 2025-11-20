import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
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
import { Field, FieldError, FieldLabel } from '~/components/ui/field'

const addCommentSchema = z.object({
  text: z.string().min(1, 'Comment is required'),
})

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

  const form = useForm({
    defaultValues: {
      text: '',
    },
    validators: {
      onSubmit: addCommentSchema,
    },
    onSubmit: async ({ value }) => {
      if (!defect) return

      setIsSubmitting(true)
      try {
        await addComment({
          defectId: defect._id as Id<'defects'>,
          text: value.text,
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
    },
  })

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
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <form.Field
            name="text"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Comment</FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    placeholder="Enter your comment..."
                    className="min-h-[120px]"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    disabled={isSubmitting}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
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
            <Button
              type="submit"
              disabled={isSubmitting || form.state.isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Comment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
