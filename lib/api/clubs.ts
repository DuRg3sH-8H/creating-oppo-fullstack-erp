const API_BASE = "/api"

export interface ClubFilters {
  category?: string
  status?: string
  search?: string
}

export interface CreateClubData {
  name: string
  logo?: string
  leadTeacher: string
  category: string
  description: string
  status?: "Open" | "Closed" | "Coming Soon"
}

export interface CreateActivityData {
  title: string
  date: string
  description: string
  images?: string[]
  minutesUrl?: string
}

export interface RegistrationData {
  schoolName: string
  schoolLogo?: string
  participantCount: number
  notes?: string
}

// Create headers for API requests (no authorization header needed - using cookies)
function createHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
  }
}

// Create fetch options with credentials (cookies)
function createFetchOptions(method = "GET", body?: any): RequestInit {
  const options: RequestInit = {
    method,
    headers: createHeaders(),
    credentials: "include", // This sends cookies with the request
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  return options
}

export async function fetchClubs(filters?: ClubFilters) {
  try {
    const params = new URLSearchParams()
    if (filters?.category && filters.category !== "all") params.append("category", filters.category)
    if (filters?.status && filters.status !== "all") params.append("status", filters.status)
    if (filters?.search) params.append("search", filters.search)

    const url = `${API_BASE}/clubs${params.toString() ? `?${params.toString()}` : ""}`
    const response = await fetch(url, createFetchOptions())

    if (!response.ok) {
      throw new Error("Failed to fetch clubs")
    }

    const result = await response.json()
    return {
      success: true,
      data: result.data || result.clubs || [],
    }
  } catch (error) {
    console.error("Error fetching clubs:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch clubs",
      data: [],
    }
  }
}

export async function fetchClubById(id: string) {
  try {
    const response = await fetch(`${API_BASE}/clubs/${id}`, createFetchOptions())

    if (!response.ok) {
      throw new Error("Failed to fetch club")
    }

    const result = await response.json()
    return {
      success: true,
      data: result.data || result.club,
    }
  } catch (error) {
    console.error("Error fetching club:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch club",
    }
  }
}

export async function createClub(data: CreateClubData) {
  try {
    const response = await fetch(`${API_BASE}/clubs`, createFetchOptions("POST", data))

    const result = await response.json()

    if (!response.ok) {
      // If authentication error, provide helpful message
      if (response.status === 401) {
        throw new Error("Please log in to create clubs")
      }
      if (response.status === 403) {
        throw new Error("Admin access required to create clubs")
      }
      throw new Error(result.error || result.message || "Failed to create club")
    }

    return {
      success: true,
      data: result.data || result.club,
      message: result.message || "Club created successfully",
    }
  } catch (error) {
    console.error("Error creating club:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create club",
    }
  }
}

export async function updateClub(id: string, data: Partial<CreateClubData>) {
  try {
    const response = await fetch(`${API_BASE}/clubs/${id}`, createFetchOptions("PUT", data))

    const result = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Please log in to update clubs")
      }
      if (response.status === 403) {
        throw new Error("Admin access required to update clubs")
      }
      throw new Error(result.error || result.message || "Failed to update club")
    }

    return {
      success: true,
      data: result.data || result.club,
      message: result.message || "Club updated successfully",
    }
  } catch (error) {
    console.error("Error updating club:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update club",
    }
  }
}

export async function deleteClub(id: string) {
  try {
    const response = await fetch(`${API_BASE}/clubs/${id}`, createFetchOptions("DELETE"))

    const result = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Please log in to delete clubs")
      }
      if (response.status === 403) {
        throw new Error("Admin access required to delete clubs")
      }
      throw new Error(result.error || result.message || "Failed to delete club")
    }

    return {
      success: true,
      message: result.message || "Club deleted successfully",
    }
  } catch (error) {
    console.error("Error deleting club:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete club",
    }
  }
}

export async function fetchClubActivities(clubId: string) {
  try {
    const response = await fetch(`${API_BASE}/clubs/${clubId}/activities`, createFetchOptions())

    if (!response.ok) {
      throw new Error("Failed to fetch activities")
    }

    const result = await response.json()
    return {
      success: true,
      data: result.data || result.activities || [],
    }
  } catch (error) {
    console.error("Error fetching activities:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch activities",
    }
  }
}

export async function createClubActivity(clubId: string, data: CreateActivityData) {
  try {
    const response = await fetch(`${API_BASE}/clubs/${clubId}/activities`, createFetchOptions("POST", data))

    const result = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Please log in to create activities")
      }
      if (response.status === 403) {
        throw new Error("Admin access required to create activities")
      }
      throw new Error(result.error || result.message || "Failed to create activity")
    }

    return {
      success: true,
      data: result.data || result.activity,
      message: result.message || "Activity created successfully",
    }
  } catch (error) {
    console.error("Error creating activity:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create activity",
    }
  }
}

export async function updateClubActivity(clubId: string, activityId: string, data: Partial<CreateActivityData>) {
  try {
    const response = await fetch(
      `${API_BASE}/clubs/${clubId}/activities/${activityId}`,
      createFetchOptions("PUT", data),
    )

    const result = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Please log in to update activities")
      }
      if (response.status === 403) {
        throw new Error("Admin access required to update activities")
      }
      throw new Error(result.error || result.message || "Failed to update activity")
    }

    return {
      success: true,
      data: result.data || result.activity,
      message: result.message || "Activity updated successfully",
    }
  } catch (error) {
    console.error("Error updating activity:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update activity",
    }
  }
}

export async function deleteClubActivity(clubId: string, activityId: string) {
  try {
    const response = await fetch(`${API_BASE}/clubs/${clubId}/activities/${activityId}`, createFetchOptions("DELETE"))

    const result = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Please log in to delete activities")
      }
      if (response.status === 403) {
        throw new Error("Admin access required to delete activities")
      }
      throw new Error(result.error || result.message || "Failed to delete activity")
    }

    return {
      success: true,
      message: result.message || "Activity deleted successfully",
    }
  } catch (error) {
    console.error("Error deleting activity:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete activity",
    }
  }
}

export async function registerForClub(clubId: string, data?: RegistrationData) {
  try {
    const response = await fetch(`${API_BASE}/clubs/${clubId}/register`, createFetchOptions("POST", data || {}))

    const result = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Please log in to register for clubs")
      }
      throw new Error(result.error || result.message || "Failed to register for club")
    }

    return {
      success: true,
      data: result.data || result.registration,
      message: result.message || "Registration successful",
    }
  } catch (error) {
    console.error("Error registering for club:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to register for club",
    }
  }
}

export async function fetchClubRegistrations(clubId: string) {
  try {
    const response = await fetch(`${API_BASE}/clubs/${clubId}/registrations`, createFetchOptions())

    if (!response.ok) {
      // Better error handling with status codes
      if (response.status === 401) {
        throw new Error("Please log in to view registrations")
      }
      if (response.status === 403) {
        throw new Error("Admin access required to view registrations")
      }
      if (response.status === 404) {
        throw new Error("Club not found")
      }

      // Try to get error message from response
      try {
        const errorResult = await response.json()
        throw new Error(errorResult.error || errorResult.message || "Failed to fetch registrations")
      } catch {
        throw new Error(`Failed to fetch registrations (${response.status})`)
      }
    }

    const result = await response.json()
    return {
      success: true,
      data: result.data || result.registrations || [],
    }
  } catch (error) {
    console.error("Error fetching club registrations:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch registrations",
      data: [], // Return empty array as fallback
    }
  }
}

export async function updateClubRegistration(clubId: string, registrationId: string, data: any) {
  try {
    const response = await fetch(
      `${API_BASE}/clubs/${clubId}/registrations/${registrationId}`,
      createFetchOptions("PUT", data),
    )

    const result = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Please log in to update registrations")
      }
      if (response.status === 403) {
        throw new Error("Admin access required to update registrations")
      }
      throw new Error(result.error || result.message || "Failed to update registration")
    }

    return {
      success: true,
      data: result.data || result.registration,
      message: result.message || "Registration updated successfully",
    }
  } catch (error) {
    console.error("Error updating registration:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update registration",
    }
  }
}

export async function removeClubRegistration(clubId: string, registrationId: string) {
  try {
    const response = await fetch(
      `${API_BASE}/clubs/${clubId}/registrations/${registrationId}`,
      createFetchOptions("DELETE"),
    )

    const result = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Please log in to remove registrations")
      }
      if (response.status === 403) {
        throw new Error("Admin access required to remove registrations")
      }
      throw new Error(result.error || result.message || "Failed to remove registration")
    }

    return {
      success: true,
      message: result.message || "Registration removed successfully",
    }
  } catch (error) {
    console.error("Error removing registration:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove registration",
    }
  }
}

// Updated unregister function to use the new endpoint
export async function unregisterFromClub(clubId: string) {
  try {
    const response = await fetch(`${API_BASE}/clubs/${clubId}/unregister`, createFetchOptions("POST"))

    const result = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Please log in to unregister from clubs")
      }
      if (response.status === 403) {
        throw new Error("Access denied")
      }
      if (response.status === 404) {
        throw new Error("Registration not found")
      }
      throw new Error(result.error || result.message || "Failed to unregister from club")
    }

    return {
      success: true,
      message: result.message || "Successfully unregistered from club",
    }
  } catch (error) {
    console.error("Error unregistering from club:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to unregister from club",
    }
  }
}

export async function fetchClubStats() {
  try {
    const response = await fetch(`${API_BASE}/clubs?stats=true`, createFetchOptions())

    if (!response.ok) {
      throw new Error("Failed to fetch club stats")
    }

    const result = await response.json()
    return {
      success: true,
      data: result.data || result.stats || {},
    }
  } catch (error) {
    console.error("Error fetching club stats:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch club stats",
    }
  }
}
