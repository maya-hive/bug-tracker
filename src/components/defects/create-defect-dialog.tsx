import { useEffect, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'

import { useMutation, useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import { toast } from 'sonner'
import type { Id } from 'convex/_generated/dataModel'
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
import { Textarea } from '~/components/ui/textarea'
import { Checkbox } from '~/components/ui/checkbox'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '~/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { ScrollArea } from '~/components/ui/scroll-area'
import { ImageDropzone } from '~/components/ui/image-dropzone'
import { useProject } from '~/hooks/use-project'

const createDefectSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  name: z.string().min(1, 'Name is required'),
  module: z.string().min(1, 'Module is required'),
  defectType: z.enum(['bug', 'improvement']),
  description: z.string().min(1, 'Description is required'),
  assignedTo: z.string().optional(),
  severity: z.enum(['cosmetic', 'medium', 'high', 'critical']),
  flags: z.array(z.enum(['unit test failure', 'content issue'])).optional(),
  status: z.enum(['open', 'fixed', 'verified', 'reopened', 'deferred']),
})

export function CreateDefectDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const createDefect = useMutation(api.defects.createDefect)
  const generateUploadUrl = useMutation(api.defects.generateUploadUrl)
  const projects = useQuery(api.projects.listProjects)
  const users = useQuery(api.users.listUsers)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedProject] = useProject()

  const form = useForm({
    defaultValues: {
      projectId: selectedProject ?? '',
      name: '',
      module: '',
      defectType: 'bug' as z.infer<typeof createDefectSchema>['defectType'],
      description: '',
      assignedTo: '__unassigned__' as z.infer<
        typeof createDefectSchema
      >['assignedTo'],
      severity: 'medium' as z.infer<typeof createDefectSchema>['severity'],
      flags: [] as Array<'unit test failure' | 'content issue'> | undefined,
      status: 'open' as z.infer<typeof createDefectSchema>['status'],
    },
    validators: {
      // @ts-expect-error - TanStack Form type inference doesn't fully support zod optional fields
      onSubmit: createDefectSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true)
      try {
        await createDefect({
          projectId: value.projectId as Id<'projects'>,
          name: value.name,
          module: value.module,
          defectType: value.defectType,
          description: value.description,
          assignedTo:
            value.assignedTo && value.assignedTo !== '__unassigned__'
              ? (value.assignedTo as Id<'users'>)
              : undefined,
          severity: value.severity,
          flags: value.flags,
          status: value.status,
          screenshot: screenshot ? (screenshot as Id<'_storage'>) : undefined,
        })

        toast.success('Defect created successfully')
        onOpenChange(false)
        form.reset()
        setScreenshot(null)
        setSelectedFile(null)
      } catch (error) {
        toast.error('Failed to create defect')
        console.error(error)
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  // Update projectId when selectedProject changes
  useEffect(() => {
    if (selectedProject) {
      form.setFieldValue('projectId', selectedProject)
    }
  }, [selectedProject, form])

  const handleFileUpload = async (file: File | null) => {
    if (!file) {
      setScreenshot(null)
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
    setUploadingFile(true)
    try {
      const uploadUrl = await generateUploadUrl()
      const result = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      })
      const responseText = await result.text()
      // Handle both JSON and plain text responses
      let storageId: string
      try {
        const parsed = JSON.parse(responseText)
        storageId = parsed.storageId || parsed
      } catch {
        storageId = responseText
      }
      setScreenshot(storageId)
      toast.success('File uploaded successfully')
    } catch (error) {
      toast.error('Failed to upload file')
      console.error(error)
      setSelectedFile(null)
    } finally {
      setUploadingFile(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Create Defect</DialogTitle>
          <DialogDescription>
            Create a new defect with details and an attachment.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <ScrollArea className="h-[60vh] pr-4">
            <FieldGroup className="space-y-4">
              <form.Field
                name="projectId"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Project</FieldLabel>
                      <Select
                        value={field.state.value}
                        onValueChange={(value) => field.handleChange(value)}
                      >
                        <SelectTrigger
                          id={field.name}
                          className="w-full"
                          aria-invalid={isInvalid}
                        >
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects?.map((project) => (
                            <SelectItem key={project._id} value={project._id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          placeholder="Enter defect name"
                          className="w-full"
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
                <form.Field
                  name="module"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Module</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          placeholder="Enter module name"
                          className="w-full"
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
              </div>
              <form.Field
                name="description"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                      <Textarea
                        id={field.name}
                        name={field.name}
                        placeholder="Enter defect description"
                        className="min-h-[100px] w-full"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form.Field
                  name="defectType"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Defect Type
                        </FieldLabel>
                        <Select
                          value={field.state.value}
                          onValueChange={(value) =>
                            field.handleChange(value as 'bug' | 'improvement')
                          }
                        >
                          <SelectTrigger
                            id={field.name}
                            className="w-full"
                            aria-invalid={isInvalid}
                          >
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bug">Bug</SelectItem>
                            <SelectItem value="improvement">
                              Improvement
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                />
                <form.Field
                  name="assignedTo"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Assigned To
                        </FieldLabel>
                        <Select
                          value={field.state.value}
                          onValueChange={(value) => field.handleChange(value)}
                        >
                          <SelectTrigger
                            id={field.name}
                            className="w-full"
                            aria-invalid={isInvalid}
                          >
                            <SelectValue placeholder="Select user (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__unassigned__">
                              Unassigned
                            </SelectItem>
                            {users?.map((user) => (
                              <SelectItem key={user._id} value={user._id}>
                                {user.name || user.email || user._id}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                />
                <form.Field
                  name="severity"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Severity</FieldLabel>
                        <Select
                          value={field.state.value}
                          onValueChange={(value) =>
                            field.handleChange(
                              value as
                                | 'cosmetic'
                                | 'medium'
                                | 'high'
                                | 'critical',
                            )
                          }
                        >
                          <SelectTrigger
                            id={field.name}
                            className="w-full"
                            aria-invalid={isInvalid}
                          >
                            <SelectValue placeholder="Select severity" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="cosmetic">Cosmetic</SelectItem>
                          </SelectContent>
                        </Select>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                />
                <form.Field
                  name="status"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Status</FieldLabel>
                        <Select
                          value={field.state.value}
                          onValueChange={(value) =>
                            field.handleChange(
                              value as
                                | 'open'
                                | 'fixed'
                                | 'verified'
                                | 'reopened'
                                | 'deferred',
                            )
                          }
                        >
                          <SelectTrigger
                            id={field.name}
                            className="w-full"
                            aria-invalid={isInvalid}
                          >
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="fixed">Fixed</SelectItem>
                            <SelectItem value="verified">Verified</SelectItem>
                            <SelectItem value="reopened">Reopened</SelectItem>
                            <SelectItem value="deferred">Deferred</SelectItem>
                          </SelectContent>
                        </Select>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                />
              </div>
              <form.Field
                name="flags"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel>Flags</FieldLabel>
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex flex-row items-start space-x-2">
                          <Checkbox
                            id="flag-unit-test"
                            checked={field.state.value?.includes(
                              'unit test failure',
                            )}
                            onCheckedChange={(checked) => {
                              const currentFlags = field.state.value || []
                              if (checked) {
                                field.handleChange([
                                  ...currentFlags,
                                  'unit test failure',
                                ])
                              } else {
                                field.handleChange(
                                  currentFlags.filter(
                                    (value) => value !== 'unit test failure',
                                  ),
                                )
                              }
                            }}
                            disabled={isSubmitting}
                          />
                          <label
                            htmlFor="flag-unit-test"
                            className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            Unit Test Failure
                          </label>
                        </div>
                        <div className="flex flex-row items-start space-x-2">
                          <Checkbox
                            id="flag-content-issue"
                            checked={field.state.value?.includes(
                              'content issue',
                            )}
                            onCheckedChange={(checked) => {
                              const currentFlags = field.state.value || []
                              if (checked) {
                                field.handleChange([
                                  ...currentFlags,
                                  'content issue',
                                ])
                              } else {
                                field.handleChange(
                                  currentFlags.filter(
                                    (value) => value !== 'content issue',
                                  ),
                                )
                              }
                            }}
                            disabled={isSubmitting}
                          />
                          <label
                            htmlFor="flag-content-issue"
                            className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            Content Issue
                          </label>
                        </div>
                      </div>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              />
              <Field>
                <FieldLabel>Screenshot</FieldLabel>
                <ImageDropzone
                  onFileSelect={handleFileUpload}
                  disabled={uploadingFile || isSubmitting}
                  currentFile={selectedFile}
                />
              </Field>
            </FieldGroup>
          </ScrollArea>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                form.reset()
                setScreenshot(null)
                setSelectedFile(null)
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting || uploadingFile || form.state.isSubmitting
              }
            >
              {isSubmitting ? 'Creating...' : 'Create Defect'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
