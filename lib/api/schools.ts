import type { School } from "@/components/schools/types"

const API_BASE = "/api/schools"

export async function fetchSchools() {

  try {
    const response = await fetch("/api/schools", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to fetch schools: ${response.status} ${errorText}`)
    }

    const data = await response.json()

    // Ensure we always return an object with schools array
    return {
      schools: Array.isArray(data.schools) ? data.schools : [],
      success: data.success || true,
    }
  } catch (error) {
    console.error("🌐 Schools fetch error:", error)
    // Return empty array on error to prevent filter issues
    return {
      schools: [],
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function createSchool(schoolData: Omit<School, "id">): Promise<School> {
  try {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(schoolData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.school
  } catch (error) {
    console.error("Error creating school:", error)
    throw error
  }
}

export async function updateSchool(schoolId: string, schoolData: Partial<School>): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/${schoolId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(schoolData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }
  } catch (error) {
    console.error("Error updating school:", error)
    throw error
  }
}

export async function deleteSchool(schoolId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/${schoolId}`, {
      method: "DELETE",
      credentials: "include",
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }
  } catch (error) {
    console.error("Error deleting school:", error)
    throw error
  }
}

export async function toggleSchoolStatus(schoolId: string): Promise<{ isActive: boolean }> {
  try {
    const response = await fetch(`${API_BASE}/${schoolId}/toggle-status`, {
      method: "PATCH",
      credentials: "include",
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return { isActive: data.isActive }
  } catch (error) {
    console.error("Error toggling school status:", error)
    throw error
  }
}

export async function fetchSchoolById(schoolId: string): Promise<School | null> {
  try {
    const response = await fetch(`${API_BASE}/${schoolId}`, {
      method: "GET",
      credentials: "include",
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.school
  } catch (error) {
    console.error("Error fetching school:", error)
    throw error
  }
}
