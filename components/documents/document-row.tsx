"use client"

import type { IDocument } from "@/models/document"
import { Eye, Edit, Trash, FileText, FileImage, FileSpreadsheet } from "lucide-react"
import { safeFormatDate, formatFileSize } from "@/lib/utils"

interface DocumentRowProps {
  document: IDocument
  onView: (document: IDocument) => void
  onEdit?: (document: IDocument) => void
  onDelete?: (document: IDocument) => void
}

export default function DocumentRow({ document, onView, onEdit, onDelete }: DocumentRowProps) {
  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />
      case "doc":
      case "docx":
        return <FileText className="h-5 w-5 text-blue-500" />
      case "xls":
      case "xlsx":
        return <FileSpreadsheet className="h-5 w-5 text-green-500" />
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <FileImage className="h-5 w-5 text-purple-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "template":
        return "bg-purple-100 text-purple-800"
      case "policy":
        return "bg-blue-100 text-blue-800"
      case "report":
        return "bg-yellow-100 text-yellow-800"
      case "form":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 mr-3">{getFileIcon(document.fileType)}</div>
          <div>
            <div className="text-sm font-medium text-gray-900">{document.name}</div>
            <div className="text-sm text-gray-500 truncate max-w-xs">{document.description}</div>
            <div className="text-xs text-gray-400">by {document.uploadedBy.name}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(document.category)}`}>
          {document.category.charAt(0).toUpperCase() + document.category.slice(1)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatFileSize(document.fileSize)}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{safeFormatDate(document.createdAt)}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{document.downloadCount || 0}</td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => onView(document)}
            className="text-blue-600 hover:text-blue-900 transition-colors"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </button>
          {onEdit && (
            <button
              onClick={() => onEdit(document)}
              className="text-green-600 hover:text-green-900 transition-colors"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(document)}
              className="text-red-600 hover:text-red-900 transition-colors"
              title="Delete"
            >
              <Trash className="h-4 w-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}
