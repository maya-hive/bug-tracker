'use client'

import { useEffect, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X } from 'lucide-react'
import { cn } from '~/lib/utils'
import { Button } from '~/components/ui/button'

interface ImageDropzoneProps {
  onFileSelect: (file: File | null) => void
  disabled?: boolean
  currentFile?: File | string | null
  previewUrl?: string | null
  className?: string
  accept?: Record<string, Array<string>>
}

export function ImageDropzone({
  onFileSelect,
  disabled = false,
  currentFile,
  previewUrl,
  className,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] as Array<string>,
  },
}: ImageDropzoneProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    onFileSelect(file)
  }

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        handleFile(acceptedFiles[0])
      }
    },
    accept,
    disabled,
    multiple: false,
    noClick: true,
    noKeyboard: false,
  })

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled) return

      const items = e.clipboardData?.items
      if (!items) return

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault()
          const file = item.getAsFile()
          if (file) {
            handleFile(file)
          }
        }
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('paste', handlePaste)
      // Make container focusable for paste events
      container.setAttribute('tabIndex', '0')
      container.setAttribute('role', 'textbox')
    }

    return () => {
      if (container) {
        container.removeEventListener('paste', handlePaste)
      }
    }
  }, [disabled])

  useEffect(() => {
    if (currentFile instanceof File) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(currentFile)
    } else if (previewUrl) {
      setPreview(previewUrl)
    } else {
      setPreview(null)
    }
  }, [currentFile, previewUrl])

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPreview(null)
    onFileSelect(null)
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'w-full',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md',
        className,
      )}
      tabIndex={0}
      role="textbox"
      aria-label="Image dropzone - click to focus and paste, or use buttons to browse files"
    >
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-md p-6 transition-colors',
          isDragActive && 'border-primary bg-primary/5',
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          preview && 'border-solid border-input',
        )}
      >
        <input {...getInputProps()} />
        {preview ? (
          <div className="space-y-2">
            <div className="relative w-full rounded-md overflow-hidden border">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-auto max-h-48 object-contain"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 size-8 bg-background/80 hover:bg-background"
                onClick={handleRemove}
                disabled={disabled}
              >
                <X className="size-4" />
              </Button>
            </div>
            {!currentFile && !previewUrl && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    open()
                  }}
                  disabled={disabled}
                >
                  <Upload className="size-4 mr-2" />
                  Replace Image
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <Upload className="size-6 text-muted-foreground" />
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {isDragActive
                  ? 'Drop the image here'
                  : 'Drag & drop an image here'}
              </p>
              <div className="flex flex-col items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    open()
                  }}
                  disabled={disabled}
                >
                  Browse Files
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
