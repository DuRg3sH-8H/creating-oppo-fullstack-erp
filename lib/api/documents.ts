const API_BASE = "/api/documents"

export class DocumentAPI {
  static async getDocuments(
    params: {
      page?: number
      limit?: number
      category?: string
      search?: string
      schoolId?: string
      fileType?: string
      dateFrom?: string
      dateTo?: string
    } = {},
  ) {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    const response = await fetch(`${API_BASE}?${searchParams}`, {
      credentials: "include",
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch documents: ${response.statusText}`)
    }

    return response.json()
  }

  static async uploadDocument(data: {
    name: string
    description: string
    category: string
    version?: string
    file: File
    isPublic: boolean
    tags: string[]
  }) {
    const formData = new FormData()
    formData.append("file", data.file)
    formData.append("name", data.name)
    formData.append("description", data.description)
    formData.append("category", data.category)
    formData.append("version", data.version || "1.0")
    formData.append("isPublic", data.isPublic.toString())
    formData.append("tags", data.tags.join(","))

    const response = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      credentials: "include",
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to upload document")
    }

    return response.json()
  }

  static async getDocument(id: string) {
    const response = await fetch(`${API_BASE}/${id}`, {
      credentials: "include",
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.statusText}`)
    }

    return response.json()
  }

  static async updateDocument(id: string, updates: any) {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      throw new Error(`Failed to update document: ${response.statusText}`)
    }

    return response.json()
  }

  static async deleteDocument(id: string) {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error(`Failed to delete document: ${response.statusText}`)
    }

    return response.json()
  }

  static async downloadDocument(id: string) {
    const response = await fetch(`${API_BASE}/${id}/download`, {
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error(`Failed to download document: ${response.statusText}`)
    }

    return response
  }

  static async getDocumentStats(schoolId?: string) {
    const searchParams = new URLSearchParams()
    if (schoolId) {
      searchParams.append("schoolId", schoolId)
    }

    const response = await fetch(`${API_BASE}/stats?${searchParams}`, {
      credentials: "include",
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch document stats: ${response.statusText}`)
    }

    return response.json()
  }
}

// Legacy function exports for backward compatibility
export async function getDocuments(url: string) {
  const response = await fetch(url, {
    credentials: "include",
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json()
}

export async function uploadDocument(url: string, file: File) {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(url, {
    method: "POST",
    body: formData,
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json()
}

export async function deleteDocument(url: string) {
  const response = await fetch(url, {
    method: "DELETE",
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.ok
}

export async function downloadDocument(url: string): Promise<Blob> {
  const response = await fetch(url, {
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.blob()
}

export async function getDocumentStats(url: string) {
  const response = await fetch(url, {
    credentials: "include",
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json()
}
