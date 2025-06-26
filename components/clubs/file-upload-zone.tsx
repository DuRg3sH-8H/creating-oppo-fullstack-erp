"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, X, ImageIcon, FileIcon } from 'lucide-react'
import { uploadFile, validateImageFile } from "@/lib/api/upload"

interface FileUploadZoneProps {
  onUpload: (url: string) => void
  onRemove?: () => void
  currentFile?: string
  accept?: string
  maxSize?: number
  className?: string
  placeholder?: string
}

export function FileUploadZone({
  onUpload,
  onRemove,
  currentFile,
  accept = "image/*",
  maxSize = 5,
  className = "",
  placeholder = "Click to upload or drag and drop"
}: FileUploadZoneProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    setError(null)
    
    // Validate file
    const validationError = validateImageFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90))
      }, 100)

      const url = await uploadFile(file, "clubs")
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      setTimeout(() => {
        onUpload(url)
        setIsUploading(false)
        setUploadProgress(0)
      }, 500)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Upload failed")
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleRemove = () => {
    if (onRemove) {
      onRemove()
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {currentFile ? (
        <Card className="relative group">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {accept.includes("image") ? (
                  <img
                    src={currentFile || "/placeholder.svg"}
                    alt="Uploaded file"
                    className="h-12 w-12 object-cover rounded border"
                  />
                ) : (
                  <div className="h-12 w-12 bg-gray-100 rounded border flex items-center justify-center">
                    <FileIcon size={20} className="text-gray-500" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">File uploaded</p>
                  <p className="text-xs text-gray-500">Click to change</p>
                </div>
              </div>
              {onRemove && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleRemove}
                >
                  <X size={14} />
                </Button>
              )}
            </div>
          </div>
          <div
            className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded"
            onClick={handleClick}
          />
        </Card>
      ) : (
        <Card
          className={`border-2 border-dashed transition-colors cursor-pointer ${
            isUploading ? "border-blue-300 bg-blue-50" : "border-gray-300 hover:border-gray-400"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={handleClick}
        >
          <div className="p-6 text-center">
            {isUploading ? (
              <div className="space-y-3">
                <div className="animate-spin mx-auto">
                  <Upload size={24} className="text-blue-500" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Uploading...</p>
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-xs text-gray-500">{uploadProgress}%</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="mx-auto">
                  {accept.includes("image") ? (
                    <ImageIcon size={24} className="text-gray-400" />
                  ) : (
                    <Upload size={24} className="text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{placeholder}</p>
                  <p className="text-xs text-gray-500">
                    {accept.includes("image") ? "PNG, JPG, GIF up to" : "Files up to"} {maxSize}MB
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}
    </div>
  )
}
