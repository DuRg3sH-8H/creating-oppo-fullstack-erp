"use client"

import type React from "react"
import { useState } from "react"
import { X, Upload, File } from "lucide-react"
import type { DocumentCategory } from "@/components/documents/types"

interface DocumentUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: () => void
}

export function DocumentUploadModal({ isOpen, onClose, onUpload }: DocumentUploadModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<DocumentCategory>("template")
  const [version, setVersion] = useState("1.0")
  const [file, setFile] = useState<File | null>(null)
  const [isPublic, setIsPublic] = useState(true)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isUploading, setIsUploading] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = "Document name is required"
    }

    if (!description.trim()) {
      newErrors.description = "Description is required"
    }

    if (!version.trim()) {
      newErrors.version = "Version is required"
    } else if (!/^\d+(\.\d+)*$/.test(version)) {
      newErrors.version = "Version must be in format like 1.0"
    }

    if (!file) {
      newErrors.file = "File is required"
    } else {
      // Validate file size (50MB limit)
      const maxSize = 50 * 1024 * 1024 // 50MB
      if (file.size > maxSize) {
        newErrors.file = "File size exceeds 50MB limit"
      }

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "image/jpeg",
        "image/png",
        "image/gif",
        "text/plain",
      ]

      if (!allowedTypes.includes(file.type)) {
        newErrors.file = "File type not supported. Please upload PDF, Word, Excel, PowerPoint, image, or text files."
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsUploading(true)

    try {
      // Create FormData properly
      const formData = new FormData()
      formData.append("file", file!)
      formData.append("name", name)
      formData.append("description", description)
      formData.append("category", category)
      formData.append("version", version)
      formData.append("isPublic", isPublic.toString())
      formData.append("tags", tags.join(","))

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Upload failed")
      }

      const result = await response.json()

      // Reset form
      setName("")
      setDescription("")
      setCategory("template")
      setVersion("1.0")
      setFile(null)
      setIsPublic(true)
      setTags([])
      setTagInput("")
      setErrors({})

      onUpload()
      onClose()
    } catch (error) {
      console.error("Error uploading document:", error)
      setErrors({ submit: error instanceof Error ? error.message : "Upload failed" })
    } finally {
      setIsUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Upload Document</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Document Name*
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3 py-2 border ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none transition-all`}
                  placeholder="Enter document name"
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description*
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 border ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none transition-all`}
                  placeholder="Enter document description"
                />
                {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category*
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none transition-all"
                  >
                    <option value="template">Template</option>
                    <option value="policy">Policy</option>
                    <option value="report">Report</option>
                    <option value="form">Form</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-1">
                    Version*
                  </label>
                  <input
                    type="text"
                    id="version"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className={`w-full px-3 py-2 border ${
                      errors.version ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none transition-all`}
                    placeholder="1.0"
                  />
                  {errors.version && <p className="mt-1 text-sm text-red-500">{errors.version}</p>}
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="rounded border-gray-300 text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
                  />
                  <span className="ml-2 text-sm text-gray-700">Make this document public</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Public documents can be accessed by all schools. Private documents are only visible to your school.
                </p>
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-[var(--primary-color)]/10 text-[var(--primary-color)] rounded-full text-xs flex items-center gap-1"
                    >
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none transition-all"
                    placeholder="Add a tag"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
                  File*
                </label>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-6 text-center ${
                    dragActive
                      ? "border-[var(--primary-color)] bg-[var(--primary-color)]/5"
                      : errors.file
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-[var(--primary-color)] hover:bg-[var(--primary-color)]/5"
                  } transition-all cursor-pointer`}
                  onClick={() => document.getElementById("file")?.click()}
                >
                  {file ? (
                    <div className="flex items-center justify-center space-x-3">
                      <File className="h-8 w-8 text-[var(--primary-color)]" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        Drag and drop your file here, or{" "}
                        <span className="text-[var(--primary-color)] font-medium">browse</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Supports PDF, Word, Excel, PowerPoint, and image formats (Max: 50MB)
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    id="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
                  />
                </div>
                {errors.file && <p className="mt-1 text-sm text-red-500">{errors.file}</p>}
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isUploading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="px-4 py-2 bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Upload size={18} className={isUploading ? "animate-spin" : ""} />
                {isUploading ? "Uploading..." : "Upload Document"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
