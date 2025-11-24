import { useEffect, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'

import { useMutation } from 'convex/react'
import { api } from 'convex/_generated/api'
import { toast } from 'sonner'
import type { Id } from 'convex/_generated/dataModel'
import type { ProjectTableItem } from './projects-table.types'
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
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '~/components/ui/field'

const editProjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
})

export function EditProjectDialog({
  project,
  open,
  onOpenChange,
}: {
  project: ProjectTableItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const updateProject = useMutation(api.projects.updateProject)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    defaultValues: {
      name: '',
    },
    validators: {
      onSubmit: editProjectSchema,
    },
    onSubmit: async ({
      value,
    }: {
      value: z.infer<typeof editProjectSchema>
    }) => {
      if (!project) return

      setIsSubmitting(true)
      try {
        await updateProject({
          projectId: project._id as Id<'projects'>,
          name: value.name,
        })

        toast.success('Project updated successfully')
        onOpenChange(false)
        form.reset()
      } catch (error) {
        toast.error('Failed to update project')
        console.error(error)
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  // Reset form when project changes
  useEffect(() => {
    if (project && open) {
      form.reset({
        name: project.name,
      })
    }
  }, [project, open, form])

  if (!project) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>Update project information.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <FieldGroup>
            <form.Field
              name="name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      placeholder="Enter project name"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      disabled={isSubmitting}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
          </FieldGroup>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || form.state.isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
