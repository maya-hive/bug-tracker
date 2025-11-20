import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, X } from 'lucide-react'

import { useMutation, useQuery } from 'convex/react'
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
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Checkbox } from '~/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

const editDefectSchema = z.object({
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

type EditDefectFormValues = z.infer<typeof editDefectSchema>

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
  const projects = useQuery(api.projects.listProjects)
  const users = useQuery(api.users.listUsers)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)

  const form = useForm<EditDefectFormValues>({
    resolver: zodResolver(editDefectSchema),
    defaultValues: {
      projectId: '',
      name: '',
      module: '',
      defectType: 'bug',
      description: '',
      assignedTo: '__unassigned__',
      severity: 'medium',
      flags: [],
      status: 'open',
    },
  })

  // Reset form when defect changes
  useEffect(() => {
    if (defect && open) {
      form.reset({
        projectId: defect.projectId,
        name: defect.name,
        module: defect.module,
        defectType: defect.defectType,
        description: defect.description,
        assignedTo: defect.assignedTo || '__unassigned__',
        severity: defect.severity,
        flags: defect.flags || [],
        status: defect.status,
      })
      setScreenshot(defect.screenshot || null)
    }
  }, [defect, open, form])

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0] // Only take the first file
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
    } finally {
      setUploadingFile(false)
    }
  }

  const removeScreenshot = () => {
    setScreenshot(null)
  }

  const onSubmit = async (values: EditDefectFormValues) => {
    if (!defect) return

    setIsSubmitting(true)
    try {
      await updateDefect({
        defectId: defect._id as Id<'defects'>,
        projectId: values.projectId as Id<'projects'>,
        name: values.name,
        module: values.module,
        defectType: values.defectType,
        description: values.description,
        assignedTo:
          values.assignedTo && values.assignedTo !== '__unassigned__'
            ? (values.assignedTo as Id<'users'>)
            : undefined,
        severity: values.severity,
        flags: values.flags,
        status: values.status,
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
  }

  if (!defect) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Defect</DialogTitle>
          <DialogDescription>Update defect information.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {projects?.map((project) => (
                        <SelectItem key={project._id} value={project._id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter defect name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="module"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Module</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter module name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="defectType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Defect Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="bug">Bug</SelectItem>
                      <SelectItem value="improvement">Improvement</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter defect description"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="assignedTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned To</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__unassigned__">Unassigned</SelectItem>
                      {users?.map((user) => (
                        <SelectItem key={user._id} value={user._id}>
                          {user.name || user.email || user._id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="flags"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Flags</FormLabel>
                    <div className="mt-2 space-y-2">
                      <FormField
                        control={form.control}
                        name="flags"
                        render={({ field }) => {
                          return (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(
                                    'unit test failure',
                                  )}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...(field.value || []),
                                          'unit test failure',
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) =>
                                              value !== 'unit test failure',
                                          ),
                                        )
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="font-normal">
                                  Unit Test Failure
                                </FormLabel>
                              </div>
                            </FormItem>
                          )
                        }}
                      />
                      <FormField
                        control={form.control}
                        name="flags"
                        render={({ field }) => {
                          return (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes('content issue')}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...(field.value || []),
                                          'content issue',
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== 'content issue',
                                          ),
                                        )
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="font-normal">
                                  Content Issue
                                </FormLabel>
                              </div>
                            </FormItem>
                          )
                        }}
                      />
                    </div>
                  </div>
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="cosmetic">Cosmetic</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="fixed">Fixed</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="reopened">Reopened</SelectItem>
                        <SelectItem value="deferred">Deferred</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormItem>
              <FormLabel>Screenshot</FormLabel>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    disabled={uploadingFile}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById('file-upload')?.click()
                    }
                    disabled={uploadingFile}
                  >
                    <Upload className="size-4 mr-2" />
                    {uploadingFile ? 'Uploading...' : 'Upload Screenshot'}
                  </Button>
                </div>
                {screenshot && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md w-fit">
                    <span className="text-sm">Screenshot attached</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-5"
                      onClick={removeScreenshot}
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                )}
              </div>
            </FormItem>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false)
                  setScreenshot(null)
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || uploadingFile}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
