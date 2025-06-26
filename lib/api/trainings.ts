import type { Training, TrainingFeedback } from "@/components/trainings/types";

export interface TrainingFilters {
  category?: string;
  trainer?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface GetTrainingsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  trainer?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginatedTrainingsResponse {
  success: boolean;
  trainings: Training[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  error?: string;
}

export interface TrainingResponse {
  success: boolean;
  training?: Training;
  error?: string;
}

export interface TrainingFeedbackResponse {
  success: boolean;
  feedback?: TrainingFeedback[];
  error?: string;
}

export interface FeedbackSubmission {
  feedback: string;
  rating: number;
}

// Get trainings with pagination and filters
export async function getTrainings(
  params: GetTrainingsParams = {}
): Promise<PaginatedTrainingsResponse> {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      trainer,
      dateFrom,
      dateTo,
    } = params;

    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    // Only add non-empty filter values
    if (search && search.trim()) {
      searchParams.append("search", search.trim());
    }
    if (category && category !== "all" && category.trim()) {
      searchParams.append("category", category.trim());
    }
    if (trainer && trainer.trim()) {
      searchParams.append("trainer", trainer.trim());
    }
    if (dateFrom) {
      searchParams.append("dateFrom", dateFrom);
    }
    if (dateTo) {
      searchParams.append("dateTo", dateTo);
    }

    const url = `/api/trainings?${searchParams.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorText = await response.text();
        // Try to parse as JSON
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `${errorMessage}: ${errorText.substring(0, 100)}`;
        }
      } catch (textError) {}

      return {
        success: false,
        trainings: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        error: errorMessage,
      };
    }

    let data;
    try {
      const responseText = await response.text();
      if (!responseText.trim()) {
        return {
          success: false,
          trainings: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
          error: "Empty response from server",
        };
      }
      data = JSON.parse(responseText);
    } catch (parseError) {
      return {
        success: false,
        trainings: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        error: "Invalid JSON response from server",
      };
    }

    if (!data.success) {
      return {
        success: false,
        trainings: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        error: data.error || "API request failed",
      };
    }

    return {
      success: true,
      trainings: Array.isArray(data.trainings) ? data.trainings : [],
      total: data.total || 0,
      page: data.page || 1,
      limit: data.limit || 10,
      totalPages: data.totalPages || 0,
    };
  } catch (error) {
    return {
      success: false,
      trainings: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
      error: `Network error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

// Legacy function name for backward compatibility
export const fetchTrainings = getTrainings;

// Get single training by ID
export async function getTraining(id: string): Promise<TrainingResponse> {
  try {
    const response = await fetch(`/api/trainings/${id}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = `${errorMessage}: ${errorText}`;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    const responseText = await response.text();
    const data = JSON.parse(responseText);

    return {
      success: true,
      training: data.training,
    };
  } catch (error) {
    return {
      success: false,
      error: `Network error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

// Create new training
export async function createTraining(
  trainingData: Omit<Training, "id">
): Promise<TrainingResponse> {
  try {
    const response = await fetch("/api/trainings", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(trainingData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = `${errorMessage}: ${errorText}`;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    const responseText = await response.text();
    const data = JSON.parse(responseText);

    return {
      success: true,
      training: data.training,
    };
  } catch (error) {
    return {
      success: false,
      error: `Network error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

// Update existing training
export async function updateTraining(
  id: string,
  trainingData: Partial<Training>
): Promise<TrainingResponse> {
  try {
    const response = await fetch(`/api/trainings/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(trainingData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = `${errorMessage}: ${errorText}`;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    const responseText = await response.text();
    const data = JSON.parse(responseText);

    return {
      success: true,
      training: data.training,
    };
  } catch (error) {
    return {
      success: false,
      error: `Network error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

// Delete training
export async function deleteTraining(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/trainings/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = `${errorMessage}: ${errorText}`;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `Network error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

// Register for training
export async function registerForTraining(
  trainingId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/trainings/${trainingId}/register`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = `${errorMessage}: ${errorText}`;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `Network error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

// Unregister from training
export async function unregisterFromTraining(
  trainingId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/trainings/${trainingId}/unregister`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = `${errorMessage}: ${errorText}`;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `Network error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

// Submit training feedback
export async function submitTrainingFeedback(
  trainingId: string,
  feedback: string,
  rating: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/trainings/${trainingId}/feedback`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ feedback, rating }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = `${errorMessage}: ${errorText}`;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `Network error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

// Alternative function name for submitTrainingFeedback
export async function submitFeedback(
  trainingId: string,
  feedbackData: FeedbackSubmission
): Promise<{ success: boolean; error?: string }> {
  return submitTrainingFeedback(
    trainingId,
    feedbackData.feedback,
    feedbackData.rating
  );
}

// Get training feedback
export async function getTrainingFeedback(
  trainingId: string
): Promise<TrainingFeedbackResponse> {
  try {
    const response = await fetch(`/api/trainings/${trainingId}/feedback`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = `${errorMessage}: ${errorText}`;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    const responseText = await response.text();
    const data = JSON.parse(responseText);

    return {
      success: true,
      feedback: data.feedback || [],
    };
  } catch (error) {
    return {
      success: false,
      error: `Network error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}
