"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink, FileText, Video, ImageIcon, File } from "lucide-react"

interface Material {
  name: string
  url: string
  type?: "document" | "video" | "image" | "other"
  size?: string
  description?: string
}

interface MaterialsModalProps {
  isOpen: boolean
  onClose: () => void
  materials: Material[]
  trainingTitle: string
}

export function MaterialsModal({ isOpen, onClose, materials, trainingTitle }: MaterialsModalProps) {
  const [loadingUrl, setLoadingUrl] = useState<string | null>(null)

  const getFileIcon = (material: Material) => {
    const url = material.url.toLowerCase()
    const type = material.type

    if (
      type === "video" ||
      url.includes("youtube") ||
      url.includes("vimeo") ||
      url.includes(".mp4") ||
      url.includes(".mov")
    ) {
      return <Video className="h-5 w-5 text-red-500" />
    }
    if (
      type === "image" ||
      url.includes(".jpg") ||
      url.includes(".png") ||
      url.includes(".gif") ||
      url.includes(".jpeg")
    ) {
      return <ImageIcon className="h-5 w-5 text-green-500" />
    }
    if (url.includes("drive.google.com") || url.includes("docs.google.com")) {
      return <FileText className="h-5 w-5 text-blue-500" />
    }
    return <File className="h-5 w-5 text-gray-500" />
  }

  const getFileType = (material: Material) => {
    const url = material.url.toLowerCase()
    const type = material.type

    if (type) return type

    if (url.includes("youtube") || url.includes("vimeo") || url.includes(".mp4") || url.includes(".mov")) {
      return "video"
    }
    if (url.includes(".jpg") || url.includes(".png") || url.includes(".gif") || url.includes(".jpeg")) {
      return "image"
    }
    if (url.includes("drive.google.com")) {
      return "google-drive"
    }
    if (url.includes("docs.google.com")) {
      return "google-docs"
    }
    return "document"
  }

  const handleOpenMaterial = async (material: Material) => {
    setLoadingUrl(material.url)
    try {
      // Log the access for analytics

      // Ensure the URL has a protocol
      let url = material.url
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        // If it's a relative URL or missing protocol, assume https
        url = url.startsWith("//") ? `https:${url}` : `https://${url}`
      }

      // Open the actual material URL in new tab
      const newWindow = window.open(url, "_blank", "noopener,noreferrer")

      if (!newWindow) {
        // Popup blocked - try alternative method
        console.warn("⚠️ Popup blocked, trying alternative method")
        window.location.href = url
      }
    } catch (error) {
      console.error("❌ Error opening material:", error)
      alert(`Failed to open material: ${material.name}. Please check if the URL is valid: ${material.url}`)
    } finally {
      setTimeout(() => setLoadingUrl(null), 1000)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "video":
        return "bg-red-100 text-red-800"
      case "image":
        return "bg-green-100 text-green-800"
      case "google-drive":
        return "bg-blue-100 text-blue-800"
      case "google-docs":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!materials || materials.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Training Materials</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No materials available for this training.</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl">Training Materials</DialogTitle>
          <p className="text-gray-600">{trainingTitle}</p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {materials.map((material, index) => {
            const fileType = getFileType(material)
            const isLoading = loadingUrl === material.url
            const url = material.url

            // Check for YouTube link
            const isYouTube = typeof url === "string" && (url.includes("youtube.com/watch") || url.includes("youtu.be/"))
            let youtubeId: string | null = null
            if (isYouTube) {
              // Extract YouTube video ID
              const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
              youtubeId = match ? match[1] : null
            }

            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0 mt-1">{getFileIcon(material)}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{material.name}</h4>
                        {material.description && <p className="text-sm text-gray-600 mt-1">{material.description}</p>}
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge className={getTypeColor(fileType)}>{fileType.replace("-", " ")}</Badge>
                          {material.size && <span className="text-xs text-gray-500">{material.size}</span>}
                        </div>
                        <p className="text-xs text-gray-400 mt-1 truncate">{material.url}</p>
                        {isYouTube && youtubeId ? (
                          <div className="mt-3">
                            <iframe
                              width="100%"
                              height="315"
                              src={`https://www.youtube.com/embed/${youtubeId}`}
                              title="YouTube video player"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                              className="rounded-lg shadow"
                            ></iframe>
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      <Button
                        onClick={() => handleOpenMaterial(material)}
                        disabled={isLoading}
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        {isLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <ExternalLink className="h-4 w-4" />
                            <span>Open</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="flex justify-between items-center mt-6 pt-4 border-t">
          <div className="text-sm text-gray-500">
            {materials.length} material{materials.length !== 1 ? "s" : ""} available
          </div>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
