export async function uploadFile(file: File, p0: string): Promise<string> {
  try {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/upload", {
      method: "POST",
      credentials: "include",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Upload failed")
    }

    const data = await response.json()
    return data.url
  } catch (error) {
    console.error("Error uploading file:", error)
    throw error
  }
}

export function validateImageFile(file: File): string | null {
  // Check file type
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
  if (!allowedTypes.includes(file.type)) {
    return "Invalid file type. Only images (JPEG, PNG, GIF, WebP) are allowed."
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return "File too large. Maximum size is 5MB."
  }

  return null
}
