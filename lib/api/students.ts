export interface StudentFilters {
  class?: string
  section?: string
  status?: string
  search?: string
  schoolId?: string
}

export interface PromotionRequest {
  studentIds: string[]
  toClass: string
  toSection: string
  academicYear: string
  notes?: string
}

export async function fetchStudents(filters?: StudentFilters) {
  const params = new URLSearchParams()

  if (filters?.class) params.append("class", filters.class)
  if (filters?.section) params.append("section", filters.section)
  if (filters?.status) params.append("status", filters.status)
  if (filters?.search) params.append("search", filters.search)
  if (filters?.schoolId) params.append("schoolId", filters.schoolId)

  const response = await fetch(`/api/students?${params.toString()}`)

  if (!response.ok) {
    throw new Error("Failed to fetch students")
  }

  return response.json()
}

export async function fetchStudentById(id: string) {
  const response = await fetch(`/api/students/${id}`)

  if (!response.ok) {
    throw new Error("Failed to fetch student")
  }

  return response.json()
}

export async function createStudent(studentData: any) {
  const response = await fetch("/api/students", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(studentData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to create student")
  }

  return response.json()
}

export async function updateStudent(id: string, studentData: any) {
  const response = await fetch(`/api/students/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(studentData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to update student")
  }

  return response.json()
}

export async function deleteStudent(id: string) {
  const response = await fetch(`/api/students/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to delete student")
  }

  return response.json()
}

export async function promoteStudents(promotionData: PromotionRequest) {
  const response = await fetch("/api/students/promote", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(promotionData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to promote students")
  }

  return response.json()
}

export async function fetchClassStructure(schoolId?: string) {
  const params = new URLSearchParams()
  if (schoolId) params.append("schoolId", schoolId)

  const response = await fetch(`/api/students/class-structure?${params.toString()}`)

  if (!response.ok) {
    throw new Error("Failed to fetch class structure")
  }

  return response.json()
}

export async function fetchPromotionHistory(schoolId?: string, academicYear?: string) {
  const params = new URLSearchParams()
  if (schoolId) params.append("schoolId", schoolId)
  if (academicYear) params.append("academicYear", academicYear)

  const response = await fetch(`/api/students/promotions?${params.toString()}`)

  if (!response.ok) {
    throw new Error("Failed to fetch promotion history")
  }

  return response.json()
}

export async function fetchGraduatedStudents(schoolId?: string, academicYear?: string) {
  const params = new URLSearchParams()
  if (schoolId) params.append("schoolId", schoolId)
  if (academicYear) params.append("academicYear", academicYear)

  const response = await fetch(`/api/students/graduated?${params.toString()}`)

  if (!response.ok) {
    throw new Error("Failed to fetch graduated students")
  }

  return response.json()
}

export async function fetchStudentsByClass(schoolId: string, className: string, section?: string) {
  const params = new URLSearchParams()
  params.append("schoolId", schoolId)
  params.append("class", className)
  if (section) params.append("section", section)

  const response = await fetch(`/api/students/by-class?${params.toString()}`)

  if (!response.ok) {
    throw new Error("Failed to fetch students by class")
  }

  return response.json()
}
