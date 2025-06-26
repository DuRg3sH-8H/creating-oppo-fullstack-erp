// API functions for user management
export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: "super-admin" | "school" | "eca";
  schoolId?: string;
  schoolName?: string;
  avatar?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: "super-admin" | "school" | "eca";
  schoolId?: string;
  schoolName?: string;
  isActive?: boolean;
  avatar?: string;
}

export interface UserFilters {
  role?: string;
  schoolId?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function fetchUsers(filters?: UserFilters) {
  const params = new URLSearchParams();

  if (filters?.role) params.append("role", filters.role);
  if (filters?.schoolId) params.append("schoolId", filters.schoolId);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.search) params.append("search", filters.search);
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());

  const url = `/api/users?${params.toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies for authentication
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export async function createUser(userData: CreateUserData) {
  try {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create user");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export async function updateUser(userId: string, userData: UpdateUserData) {
  const response = await fetch(`/api/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update user");
  }

  return response.json();
}

export async function deleteUser(userId: string) {
  const response = await fetch(`/api/users/${userId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete user");
  }

  return response.json();
}

export async function toggleUserStatus(userId: string) {
  const response = await fetch(`/api/users/${userId}/toggle-status`, {
    method: "PATCH",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to toggle user status");
  }

  return response.json();
}

export async function resetUserPassword(userId: string, newPassword?: string) {
  const response = await fetch(`/api/users/${userId}/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ newPassword }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to reset password");
  }

  return response.json();
}
