"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, Save, FileText } from "lucide-react"
import type { DocumentCategory } from "@/components/documents/types"
import type { IDocument } from "@/models/document"
import { DocumentAPI } from "@/lib/api/documents"

interface EditDocumentModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
  document: IDocument | null
}

export function EditDocumentModal({ isOpen, onClose, onUpdate, document }: EditDocumentModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<DocumentCategory>("template")
  const [version, setVersion] = useState("1.0")
  const [isPublic, setIsPublic] = useState(true)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isUpdating, setIsUpdating] = useState(false)

  // Populate form when document changes
  useEffect(() => {
    if (document) {
      setName(document.name)
      setDescription(document.description)
      setCategory(document.category as DocumentCategory)
      setVersion(document.version)
      setIsPublic(document.isPublic)
      setTags(document.tags || [])
      setTagInput("")
      setErrors({})
    }
  }, [document])

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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!document || !validateForm()) {
      return
    }

    setIsUpdating(true)

    try {
      const updates = {
        name,
        description,
        category,
        version,
        isPublic,
        tags,
      }

      await DocumentAPI.updateDocument(document._id!, updates)

      // Reset form
      setErrors({})
      onUpdate()
      onClose()
    } catch (error) {
      console.error("Error updating document:", error)
      setErrors({ submit: error instanceof Error ? error.message : "Update failed" })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleClose = () => {
    setErrors({})
    onClose()
  }

  if (!isOpen || !document) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-[var(--primary-color)]" />
            <h2 className="text-xl font-semibold text-gray-900">Edit Document</h2>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-500 transition-colors">
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

              {/* Current File Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Current File</h3>
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{document.originalName}</p>
                    <p className="text-xs text-gray-500">
                      {(document.fileSize / 1024 / 1024).toFixed(2)} MB • Uploaded{" "}
                      {new Date(document.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Note: You can only edit document metadata. To change the file, please upload a new document.
                </p>
              </div>

              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Document Name*
                </label>
                <input
                  type="text"
                  id="edit-name"
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
                <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description*
                </label>
                <textarea
                  id="edit-description"
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
                  <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category*
                  </label>
                  <select
                    id="edit-category"
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
                  <label htmlFor="edit-version" className="block text-sm font-medium text-gray-700 mb-1">
                    Version*
                  </label>
                  <input
                    type="text"
                    id="edit-version"
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
                <label htmlFor="edit-tags" className="block text-sm font-medium text-gray-700 mb-1">
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
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isUpdating}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="px-4 py-2 bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={18} className={isUpdating ? "animate-spin" : ""} />
                {isUpdating ? "Updating..." : "Update Document"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
