import { useEffect, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { ChevronsUpDown } from 'lucide-react'

import { useMutation, useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import { toast } from 'sonner'
import type { Id } from 'convex/_generated/dataModel'
import type { DefectTableItem } from './defects-table.types'
import type { DefectFormInput } from '~/components/defects/defect-form.types'
import { defectFormSchema } from '~/components/defects/defect-form.types'
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
import { Checkbox } from '~/components/ui/checkbox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/components/ui/command'
import { ImageDropzone } from '~/components/ui/image-dropzone'

export function EditDefectDialog({
  defect,
  open,
  onOpenChange,
}: {
  defect: DefectTableItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const updateDefect = useMutation(api.defects.updateDefect)
  const generateUploadUrl = useMutation(api.defects.generateUploadUrl)
  const users = useQuery(api.users.listUsers)
  const defectTypes = useQuery(api.defects.getDefectTypes)
  const defectSeverities = useQuery(api.defects.getDefectSeverities)
  const defectPriorities = useQuery(api.defects.getDefectPriorities)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [assignedToOpen, setAssignedToOpen] = useState(false)
  const [typesOpen, setTypesOpen] = useState(false)
  const project = useQuery(api.projects.getProject, {
    projectId: defect?.projectId ?? null,
  } as { projectId: Id<'projects'> | null })

  const existingScreenshotUrl = useQuery(
    api.defects.getFileUrl,
    defect?.screenshot && !selectedFile
      ? { storageId: defect.screenshot as Id<'_storage'> }
      : 'skip',
  )

  const form = useForm({
    defaultValues: {
      projectId: (defect?.projectId || '') as string,
      name: defect?.name || '',
      types: (defect?.types || []).map((t) => t._id) as Array<string>,
      description: defect?.description || '',
      assignedTo: (defect?.assignedTo || '') as string,
      severity: defect?.severity._id,
      priority: defect?.priority._id,
      status: defect?.status._id,
    } as DefectFormInput,
    validators: {
      onSubmit: defectFormSchema,
    },
    onSubmit: async ({ value }) => {
      if (!defect) return

      setIsSubmitting(true)
      try {
        const validated = defectFormSchema.parse(value)

        await updateDefect({
          defectId: defect._id as Id<'defects'>,
          projectId: validated.projectId as Id<'projects'>,
          name: validated.name,
          description: validated.description,
          types: validated.types as Array<Id<'defectTypes'>>,
          assignedTo: validated.assignedTo as Id<'users'>,
          severity: validated.severity as Id<'defectSeverities'>,
          priority: validated.priority as Id<'defectPriorities'>,
          status: validated.status as Id<'defectStatuses'>,
          screenshot: screenshot ? (screenshot as Id<'_storage'>) : undefined,
        })

        toast.success('Defect updated successfully')
        onOpenChange(false)
        form.reset()
        setScreenshot(null)
      } catch (error) {
        toast.error('Failed to update defect')
        console.error(error)
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  useEffect(() => {
    if (defect && open) {
      form.reset({
        projectId: String(defect.projectId),
        name: defect.name,
        types: defect.types.map((t) => t._id),
        description: defect.description,
        assignedTo: String(defect.assignedTo || ''),
        severity: defect.severity._id,
        priority: defect.priority._id,
        status: defect.status._id,
      })

      setScreenshot(defect.screenshot || null)
      setSelectedFile(null)
    } else if (!open) {
      form.reset()
      setScreenshot(null)
      setSelectedFile(null)
    }
  }, [defect, open, form])

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

  if (!defect) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Defect in {project?.name}</DialogTitle>
          <DialogDescription>
            Update defect information and attach a screenshot if applicable.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <div className="pr-4 max-h-[calc(90vh-180px)] overflow-y-auto">
            <FieldGroup className="gap-4">
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
                        className="w-full"
                        rows={2}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <form.Field
                  name="types"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    const selectedTypes = field.state.value
                    const displayValue =
                      selectedTypes.length === 0
                        ? 'Select types'
                        : selectedTypes.length === 1
                          ? defectTypes?.find((t) => t._id === selectedTypes[0])
                              ?.label || 'Select types'
                          : `${selectedTypes.length} types selected`
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Types</FieldLabel>
                        <Popover open={typesOpen} onOpenChange={setTypesOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              id={field.name}
                              variant="outline"
                              role="combobox"
                              aria-expanded={typesOpen}
                              className="w-full justify-between"
                              aria-invalid={isInvalid}
                              disabled={isSubmitting || !defectTypes}
                            >
                              {displayValue}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search types..." />
                              <CommandList>
                                <CommandEmpty>No type found.</CommandEmpty>
                                <CommandGroup>
                                  {defectTypes?.map((type) => {
                                    const isSelected = selectedTypes.includes(
                                      type._id,
                                    )
                                    return (
                                      <CommandItem
                                        key={type._id}
                                        value={type._id}
                                        onSelect={() => {
                                          const newTypes = isSelected
                                            ? selectedTypes.filter(
                                                (t) => t !== type._id,
                                              )
                                            : [...selectedTypes, type._id]
                                          field.handleChange(newTypes)
                                        }}
                                        className="flex items-center gap-2"
                                      >
                                        <Checkbox
                                          checked={isSelected}
                                          onCheckedChange={() => {
                                            const newTypes = isSelected
                                              ? selectedTypes.filter(
                                                  (t) => t !== type._id,
                                                )
                                              : [...selectedTypes, type._id]
                                            field.handleChange(newTypes)
                                          }}
                                        />
                                        {type.label}
                                      </CommandItem>
                                    )
                                  })}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
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
                    const selectedUser = users?.find(
                      (user) => user._id === field.state.value,
                    )
                    const displayValue =
                      selectedUser?.name ||
                      selectedUser?.email ||
                      selectedUser?._id ||
                      'Select user'
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Assigned To
                        </FieldLabel>
                        <Popover
                          open={assignedToOpen}
                          onOpenChange={setAssignedToOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              id={field.name}
                              variant="outline"
                              role="combobox"
                              aria-expanded={assignedToOpen}
                              className="w-full justify-between"
                              aria-invalid={isInvalid}
                              disabled={isSubmitting}
                            >
                              {displayValue}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search user..." />
                              <CommandList>
                                <CommandEmpty>No user found.</CommandEmpty>
                                <CommandGroup>
                                  {users?.map((userItem) => {
                                    const userLabel =
                                      userItem.name ||
                                      userItem.email ||
                                      userItem._id
                                    return (
                                      <CommandItem
                                        key={userItem._id}
                                        value={userLabel}
                                        onSelect={() => {
                                          field.handleChange(userItem._id)
                                          setAssignedToOpen(false)
                                        }}
                                      >
                                        {userLabel}
                                      </CommandItem>
                                    )
                                  })}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
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
                          onValueChange={(value) => field.handleChange(value)}
                          disabled={!defectSeverities}
                        >
                          <SelectTrigger
                            id={field.name}
                            className="w-full"
                            aria-invalid={isInvalid}
                          >
                            <SelectValue placeholder="Select severity" />
                          </SelectTrigger>
                          <SelectContent>
                            {defectSeverities?.map((severity) => (
                              <SelectItem
                                key={severity._id}
                                value={severity._id}
                              >
                                {severity.label}
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
                  name="priority"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Priority</FieldLabel>
                        <Select
                          value={field.state.value}
                          onValueChange={(value) => field.handleChange(value)}
                          disabled={!defectPriorities}
                        >
                          <SelectTrigger
                            id={field.name}
                            className="w-full"
                            aria-invalid={isInvalid}
                          >
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            {defectPriorities?.map((priority) => (
                              <SelectItem
                                key={priority._id}
                                value={priority._id}
                              >
                                {priority.label}
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
              </div>
              <Field>
                <FieldLabel>Screenshot</FieldLabel>
                <ImageDropzone
                  onFileSelect={handleFileUpload}
                  disabled={uploadingFile || isSubmitting}
                  currentFile={selectedFile}
                  previewUrl={
                    selectedFile
                      ? undefined
                      : existingScreenshotUrl || undefined
                  }
                />
              </Field>
            </FieldGroup>
          </div>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                form.reset()
                setScreenshot(null)
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
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
