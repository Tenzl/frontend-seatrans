import { apiClient } from "@/shared/utils/apiClient";
import { API_CONFIG } from "@/shared/config/api.config";
import type { ApiResponse } from "@/shared/types/api.types";

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  postCount: number;
}

export const categoryService = {
  getAllCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<ApiResponse<Category[]>>(
      API_CONFIG.CATEGORIES.PUBLIC_BASE,
      {
        skipAuth: true,
      },
    );
    if (!response.ok) throw new Error("Unable to load categories");
    const result = await response.json();
    if (!result.success || !Array.isArray(result.data))
      throw new Error("Invalid categories response");
    return result.data;
  },
};
