"use client"

import type { IDocument } from "@/models/document"
import DocumentCard from "./document-card"

interface DocumentGridProps {
  documents: IDocument[]
  onView: (document: IDocument) => void
  onEdit?: (document: IDocument) => void
  onDelete?: (document: IDocument) => void
}

export function DocumentGrid({ documents, onView, onEdit, onDelete }: DocumentGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {documents.map((document) => (
        <DocumentCard
          key={document._id}
          document={document}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
