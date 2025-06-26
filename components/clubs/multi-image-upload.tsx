"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, X, ImageIcon, Plus } from 'lucide-react'
import { uploadFile, validateImageFile } from "@/lib/api/upload"

interface MultiImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  className?: string
}

export function MultiImageUpload({
  images,
  onImagesChange,
  maxImages = 10,
  className = ""
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState<{ [key: string]: number }>({})
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const handleFileSelect = async (files: FileList) => {
    const fileArray = Array.from(files)
    const remainingSlots = maxImages - images.length
    const filesToUpload = fileArray.slice(0, remainingSlots)

    for (const file of filesToUpload) {
      const uploadId = `upload-${Date.now()}-${Math.random()}`
      
      // Validate file
      const validationError = validateImageFile(file)
      if (validationError) {
        setErrors(prev => ({ ...prev, [uploadId]: validationError }))
        continue
      }

      setUploading(prev => ({ ...prev, [uploadId]: 0 }))
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[uploadId]
        return newErrors
      })

      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploading(prev => ({
            ...prev,
            [uploadId]: Math.min((prev[uploadId] || 0) + 10, 90)
          }))
        }, 100)

        const url = await uploadFile(file, "clubs")
        
        clearInterval(progressInterval)
        setUploading(prev => ({ ...prev, [uploadId]: 100 }))
        
        setTimeout(() => {
          onImagesChange([...images, url])
          setUploading(prev => {
            const newUploading = { ...prev }
            delete newUploading[uploadId]
            return newUploading
          })
        }, 500)
      } catch (error) {
        setErrors(prev => ({
          ...prev,
          [uploadId]: error instanceof Error ? error.message : "Upload failed"
        }))
        setUploading(prev => {
          const newUploading = { ...prev }
          delete newUploading[uploadId]
          return newUploading
        })
      }
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const canAddMore = images.length < maxImages && Object.keys(uploading).length === 0

  return (
    <div className={className}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Existing Images */}
        {images.map((image, index) => (
          <Card key={index} className="relative group aspect-square">
            <img
              src={image || "/placeholder.svg"}
              alt={`Activity image ${index + 1}`}
              className="w-full h-full object-cover rounded"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleRemoveImage(index)}
            >
              <X size={12} />
            </Button>
          </Card>
        ))}

        {/* Uploading Images */}
        {Object.entries(uploading).map(([uploadId, progress]) => (
          <Card key={uploadId} className="aspect-square">
            <div className="w-full h-full flex flex-col items-center justify-center p-4">
              <div className="animate-spin mb-2">
                <Upload size={20} className="text-blue-500" />
              </div>
              <Progress value={progress} className="w-full mb-1" />
              <p className="text-xs text-gray-500">{progress}%</p>
            </div>
          </Card>
        ))}

        {/* Add More Button */}
        {canAddMore && (
          <Card
            className="aspect-square border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => {
              const input = document.createElement("input")
              input.type = "file"
              input.accept = "image/*"
              input.multiple = true
              input.onchange = (e) => {
                const target = e.target as HTMLInputElement
                if (target.files) {
                  handleFileSelect(target.files)
                }
              }
              input.click()
            }}
          >
            <div className="w-full h-full flex flex-col items-center justify-center p-4">
              <Plus size={20} className="text-gray-400 mb-2" />
              <p className="text-xs text-gray-500 text-center">Add Image</p>
            </div>
          </Card>
        )}
      </div>

      {/* Error Messages */}
      {Object.entries(errors).map(([uploadId, error]) => (
        <p key={uploadId} className="text-sm text-red-600 mt-2">{error}</p>
      ))}

      {/* Info Text */}
      <p className="text-xs text-gray-500 mt-2">
        {images.length}/{maxImages} images • PNG, JPG, GIF up to 5MB each
      </p>
    </div>
  )
}
