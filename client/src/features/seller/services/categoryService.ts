import axiosSeller from "@/lib/api/axiosSeller";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import {
  Category,
  CategoryFormData,
  CategoryTree,
  ApiResponse,
  PaginatedResponse,
} from "@/types/global";

// Helper function to build query parameters
const buildQueryParams = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, item.toString()));
      } else {
        searchParams.append(key, value.toString());
      }
    }
  });

  return searchParams.toString();
};

// Get all categories with optional filters
export const getCategories = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  parent?: string;
  level?: number;
  isActive?: boolean;
  isFeatured?: boolean;
}): Promise<PaginatedResponse<Category>> => {
  const queryString = params ? buildQueryParams(params) : "";
  const url = `${API_ENDPOINTS.CATEGORIES}${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await axiosSeller.get<PaginatedResponse<Category>>(url);
  return response.data;
};

// Get category tree structure
export const getCategoryTree = async (): Promise<CategoryTree[]> => {
  const response = await axiosSeller.get<ApiResponse<CategoryTree[]>>(
    `${API_ENDPOINTS.CATEGORIES}/tree`
  );
  return response.data.data;
};

// Get root categories (level 0)
export const getRootCategories = async (): Promise<Category[]> => {
  const response = await axiosSeller.get<ApiResponse<Category[]>>(
    `${API_ENDPOINTS.CATEGORIES}/root`
  );
  return response.data.data;
};

// Get categories by level
export const getCategoriesByLevel = async (
  level: number
): Promise<Category[]> => {
  const response = await axiosSeller.get<ApiResponse<Category[]>>(
    `${API_ENDPOINTS.CATEGORIES}/level/${level}`
  );
  return response.data.data;
};

// Get featured categories
export const getFeaturedCategories = async (): Promise<Category[]> => {
  const response = await axiosSeller.get<ApiResponse<Category[]>>(
    `${API_ENDPOINTS.CATEGORIES}/featured`
  );
  return response.data.data;
};

// Get single category by ID
export const getCategory = async (id: string): Promise<Category> => {
  const response = await axiosSeller.get<ApiResponse<Category>>(
    `${API_ENDPOINTS.CATEGORIES}/${id}`
  );
  return response.data.data;
};

// Get category by slug
export const getCategoryBySlug = async (slug: string): Promise<Category> => {
  const response = await axiosSeller.get<ApiResponse<Category>>(
    `${API_ENDPOINTS.CATEGORIES}/slug/${slug}`
  );
  return response.data.data;
};

// Get category children
export const getCategoryChildren = async (
  parentId: string
): Promise<Category[]> => {
  const response = await axiosSeller.get<ApiResponse<Category[]>>(
    `${API_ENDPOINTS.CATEGORIES}/${parentId}/children`
  );
  return response.data.data;
};

// Get category ancestors (breadcrumb path)
export const getCategoryAncestors = async (
  categoryId: string
): Promise<Category[]> => {
  const response = await axiosSeller.get<ApiResponse<Category[]>>(
    `${API_ENDPOINTS.CATEGORIES}/${categoryId}/ancestors`
  );
  return response.data.data;
};

// Create new category
export const createCategory = async (
  categoryData: CategoryFormData
): Promise<Category> => {
  const response = await axiosSeller.post<ApiResponse<Category>>(
    API_ENDPOINTS.CATEGORIES,
    categoryData
  );
  return response.data.data;
};

// Update category
export const updateCategory = async (
  id: string,
  categoryData: Partial<CategoryFormData>
): Promise<Category> => {
  const response = await axiosSeller.put<ApiResponse<Category>>(
    `${API_ENDPOINTS.CATEGORIES}/${id}`,
    categoryData
  );
  return response.data.data;
};

// Delete category
export const deleteCategory = async (id: string): Promise<void> => {
  await axiosSeller.delete(`${API_ENDPOINTS.CATEGORIES}/${id}`);
};

// Bulk delete categories
export const bulkDeleteCategories = async (
  categoryIds: string[]
): Promise<void> => {
  await axiosSeller.delete(`${API_ENDPOINTS.CATEGORIES}/bulk`, {
    data: { categoryIds },
  });
};

// Update category status
export const updateCategoryStatus = async (
  id: string,
  isActive: boolean
): Promise<Category> => {
  const response = await axiosSeller.patch<ApiResponse<Category>>(
    `${API_ENDPOINTS.CATEGORIES}/${id}/status`,
    {
      isActive,
    }
  );
  return response.data.data;
};

// Toggle featured status
export const toggleCategoryFeatured = async (
  id: string,
  isFeatured: boolean
): Promise<Category> => {
  const response = await axiosSeller.patch<ApiResponse<Category>>(
    `${API_ENDPOINTS.CATEGORIES}/${id}/featured`,
    {
      isFeatured,
    }
  );
  return response.data.data;
};

// Update category sort order
export const updateCategorySortOrder = async (
  id: string,
  sortOrder: number
): Promise<Category> => {
  const response = await axiosSeller.patch<ApiResponse<Category>>(
    `${API_ENDPOINTS.CATEGORIES}/${id}/sort-order`,
    {
      sortOrder,
    }
  );
  return response.data.data;
};

// Move category to different parent
export const moveCategoryToParent = async (
  categoryId: string,
  newParentId: string | null
): Promise<Category> => {
  const response = await axiosSeller.patch<ApiResponse<Category>>(
    `${API_ENDPOINTS.CATEGORIES}/${categoryId}/move`,
    {
      parentId: newParentId,
    }
  );
  return response.data.data;
};

// Search categories
export const searchCategories = async (
  searchTerm: string
): Promise<Category[]> => {
  const response = await axiosSeller.get<ApiResponse<Category[]>>(
    `${API_ENDPOINTS.CATEGORIES}/search?q=${encodeURIComponent(searchTerm)}`
  );
  return response.data.data;
};

// Upload category image
export const uploadCategoryImage = async (
  categoryId: string,
  imageFile: File
): Promise<{ imageUrl: string }> => {
  const formData = new FormData();
  formData.append("categoryImage", imageFile);

  const endpoint = API_ENDPOINTS.UPLOAD.uploadCategoryImage(categoryId);
  const response = await axiosSeller.post<ApiResponse<{ imageUrl: string }>>(
    endpoint.url,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data.data;
};

// Get category statistics
export const getCategoryStatistics = async (): Promise<{
  totalCategories: number;
  activeCategories: number;
  featuredCategories: number;
  categoriesByLevel: { level: number; count: number }[];
}> => {
  const response = await axiosSeller.get<ApiResponse<any>>(
    `${API_ENDPOINTS.CATEGORIES}/statistics`
  );
  return response.data.data;
};

// Validate category hierarchy (check if move is valid)
export const validateCategoryMove = async (
  categoryId: string,
  newParentId: string | null
): Promise<{ isValid: boolean; reason?: string }> => {
  const response = await axiosSeller.post<
    ApiResponse<{ isValid: boolean; reason?: string }>
  >(`${API_ENDPOINTS.CATEGORIES}/validate-move`, { categoryId, newParentId });
  return response.data.data;
};

export default {
  getCategories,
  getCategoryTree,
  getRootCategories,
  getCategoriesByLevel,
  getFeaturedCategories,
  getCategory,
  getCategoryBySlug,
  getCategoryChildren,
  getCategoryAncestors,
  createCategory,
  updateCategory,
  deleteCategory,
  bulkDeleteCategories,
  updateCategoryStatus,
  toggleCategoryFeatured,
  updateCategorySortOrder,
  moveCategoryToParent,
  searchCategories,
  uploadCategoryImage,
  getCategoryStatistics,
  validateCategoryMove,
};
