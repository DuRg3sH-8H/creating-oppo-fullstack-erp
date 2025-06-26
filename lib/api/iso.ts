const API_BASE = "/api/iso"

// Clause Management
export async function fetchClauses() {

  const response = await fetch(`${API_BASE}/clauses`, {
    credentials: "include", // Include cookies
  })


  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to fetch clauses: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  return data
}

export async function createClause(data: {
  number: string
  title: string
  description: string
  requirements: string[]
}) {
  const response = await fetch(`${API_BASE}/clauses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to create clause")
  }

  return response.json()
}

export async function updateClause(
  id: string,
  data: {
    number?: string
    title?: string
    description?: string
    requirements?: string[]
  },
) {
  const response = await fetch(`${API_BASE}/clauses/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to update clause")
  }

  return response.json()
}

export async function deleteClause(id: string) {
  const response = await fetch(`${API_BASE}/clauses/${id}`, {
    method: "DELETE",
    credentials: "include",
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to delete clause")
  }

  return response.json()
}

export async function uploadGuidelines(clauseId: string, files: File[]) {
  const formData = new FormData()

  files.forEach((file) => formData.append("files", file))
  formData.append("type", "guideline")

  const uploadResponse = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    credentials: "include",
    body: formData,
  })

  if (!uploadResponse.ok) {
    const error = await uploadResponse.json()
    throw new Error(error.error || "Failed to upload files")
  }

  const { files: uploadedFiles } = await uploadResponse.json()

  // Add guidelines to clause
  const response = await fetch(`${API_BASE}/clauses/${clauseId}/guidelines`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ guidelines: uploadedFiles }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to add guidelines")
  }

  return response.json()
}

// Submission Management
export async function fetchSubmissions(filters?: {
  status?: string
  schoolId?: string
  clauseId?: string
}) {
  const params = new URLSearchParams()

  if (filters?.status) params.append("status", filters.status)
  if (filters?.schoolId) params.append("schoolId", filters.schoolId)
  if (filters?.clauseId) params.append("clauseId", filters.clauseId)

  const response = await fetch(`${API_BASE}/submissions?${params}`, {
    credentials: "include",
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("Submissions API error:", errorText)
    throw new Error(`Failed to fetch submissions: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  return data
}

export async function submitDocuments(clauseId: string, files: File[]) {
  const formData = new FormData()

  files.forEach((file) => formData.append("files", file))
  formData.append("type", "submission")

  // Upload files first
  const uploadResponse = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    credentials: "include",
    body: formData,
  })

  if (!uploadResponse.ok) {
    const error = await uploadResponse.json()
    throw new Error(error.error || "Failed to upload files")
  }

  const { files: uploadedFiles } = await uploadResponse.json()

  // Create submission
  const response = await fetch(`${API_BASE}/submissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      clauseId,
      documents: uploadedFiles,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to create submission")
  }

  return response.json()
}

export async function reviewSubmission(submissionId: string, status: "approved" | "rejected", comments?: string) {
  const response = await fetch(`${API_BASE}/submissions/${submissionId}/review`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ status, comments }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to review submission")
  }

  return response.json()
}

// Analytics
export async function fetchAnalytics(type?: "schools") {
  const params = type ? `?type=${type}` : ""

  const response = await fetch(`${API_BASE}/analytics${params}`, {
    credentials: "include",
  })

  if (!response.ok) throw new Error("Failed to fetch analytics")
  return response.json()
}

// Get school's clause status (for school admins)
export async function fetchSchoolClauseStatus() {
  const response = await fetch(`${API_BASE}/submissions/status`, {
    credentials: "include",
  })

  if (!response.ok) throw new Error("Failed to fetch clause status")
  return response.json()
}
