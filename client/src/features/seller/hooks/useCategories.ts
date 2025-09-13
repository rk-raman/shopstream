import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as categoryService from "../services/categoryService";
import { Category, CategoryFormData, CategoryTree } from "@/types/global";

// Query Keys
export const CATEGORY_QUERY_KEYS = {
  all: ["categories"] as const,
  lists: () => [...CATEGORY_QUERY_KEYS.all, "list"] as const,
  list: (filters: any) =>
    [...CATEGORY_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...CATEGORY_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...CATEGORY_QUERY_KEYS.details(), id] as const,
  tree: () => [...CATEGORY_QUERY_KEYS.all, "tree"] as const,
  roots: () => [...CATEGORY_QUERY_KEYS.all, "roots"] as const,
  level: (level: number) =>
    [...CATEGORY_QUERY_KEYS.all, "level", level] as const,
  featured: () => [...CATEGORY_QUERY_KEYS.all, "featured"] as const,
  children: (parentId: string) =>
    [...CATEGORY_QUERY_KEYS.all, "children", parentId] as const,
  ancestors: (categoryId: string) =>
    [...CATEGORY_QUERY_KEYS.all, "ancestors", categoryId] as const,
  search: (term: string) =>
    [...CATEGORY_QUERY_KEYS.all, "search", term] as const,
  statistics: () => [...CATEGORY_QUERY_KEYS.all, "statistics"] as const,
};

// Get Categories
export const useCategories = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  parent?: string;
  level?: number;
  isActive?: boolean;
  isFeatured?: boolean;
}) => {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.list(params),
    queryFn: () => categoryService.getCategories(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get Category Tree
export const useCategoryTree = () => {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.tree(),
    queryFn: categoryService.getCategoryTree,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get Root Categories
export const useRootCategories = () => {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.roots(),
    queryFn: categoryService.getRootCategories,
    staleTime: 10 * 60 * 1000,
  });
};

// Get Categories by Level
export const useCategoriesByLevel = (level: number) => {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.level(level),
    queryFn: () => categoryService.getCategoriesByLevel(level),
    staleTime: 10 * 60 * 1000,
  });
};

// Get Featured Categories
export const useFeaturedCategories = () => {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.featured(),
    queryFn: categoryService.getFeaturedCategories,
    staleTime: 10 * 60 * 1000,
  });
};

// Get Single Category
export const useCategory = (id: string) => {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.detail(id),
    queryFn: () => categoryService.getCategory(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Get Category Children
export const useCategoryChildren = (parentId: string) => {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.children(parentId),
    queryFn: () => categoryService.getCategoryChildren(parentId),
    enabled: !!parentId,
    staleTime: 5 * 60 * 1000,
  });
};

// Get Category Ancestors
export const useCategoryAncestors = (categoryId: string) => {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.ancestors(categoryId),
    queryFn: () => categoryService.getCategoryAncestors(categoryId),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
  });
};

// Search Categories
export const useSearchCategories = (searchTerm: string) => {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.search(searchTerm),
    queryFn: () => categoryService.searchCategories(searchTerm),
    enabled: !!searchTerm && searchTerm.length > 2,
    staleTime: 2 * 60 * 1000,
  });
};

// Get Category Statistics
export const useCategoryStatistics = () => {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.statistics(),
    queryFn: categoryService.getCategoryStatistics,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Create Category
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoryService.createCategory,
    onSuccess: (newCategory) => {
      // Invalidate and refetch categories
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.all });

      // Add to cache
      queryClient.setQueryData(
        CATEGORY_QUERY_KEYS.detail(newCategory._id),
        newCategory
      );

      toast.success("Category created successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to create category"
      );
    },
  });
};

// Update Category
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CategoryFormData>;
    }) => categoryService.updateCategory(id, data),
    onSuccess: (updatedCategory) => {
      // Update cache
      queryClient.setQueryData(
        CATEGORY_QUERY_KEYS.detail(updatedCategory._id),
        updatedCategory
      );

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.tree() });

      toast.success("Category updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update category"
      );
    },
  });
};

// Delete Category
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoryService.deleteCategory,
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: CATEGORY_QUERY_KEYS.detail(deletedId),
      });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.all });

      toast.success("Category deleted successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete category"
      );
    },
  });
};

// Bulk Delete Categories
export const useBulkDeleteCategories = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoryService.bulkDeleteCategories,
    onSuccess: (_, deletedIds) => {
      // Remove from cache
      deletedIds.forEach((id) => {
        queryClient.removeQueries({ queryKey: CATEGORY_QUERY_KEYS.detail(id) });
      });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.all });

      toast.success(`${deletedIds.length} categories deleted successfully`);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete categories"
      );
    },
  });
};

// Update Category Status
export const useUpdateCategoryStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      categoryService.updateCategoryStatus(id, isActive),
    onSuccess: (updatedCategory) => {
      // Update cache
      queryClient.setQueryData(
        CATEGORY_QUERY_KEYS.detail(updatedCategory._id),
        updatedCategory
      );

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.lists() });

      toast.success(
        `Category ${
          updatedCategory.isActive ? "activated" : "deactivated"
        } successfully`
      );
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update category status"
      );
    },
  });
};

// Toggle Featured Status
export const useToggleCategoryFeatured = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isFeatured }: { id: string; isFeatured: boolean }) =>
      categoryService.toggleCategoryFeatured(id, isFeatured),
    onSuccess: (updatedCategory) => {
      // Update cache
      queryClient.setQueryData(
        CATEGORY_QUERY_KEYS.detail(updatedCategory._id),
        updatedCategory
      );

      // Invalidate featured list
      queryClient.invalidateQueries({
        queryKey: CATEGORY_QUERY_KEYS.featured(),
      });
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.lists() });

      toast.success(
        `Category ${
          updatedCategory.isFeatured ? "featured" : "unfeatured"
        } successfully`
      );
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update featured status"
      );
    },
  });
};

// Move Category
export const useMoveCategoryToParent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      newParentId,
    }: {
      categoryId: string;
      newParentId: string | null;
    }) => categoryService.moveCategoryToParent(categoryId, newParentId),
    onSuccess: (updatedCategory) => {
      // Update cache
      queryClient.setQueryData(
        CATEGORY_QUERY_KEYS.detail(updatedCategory._id),
        updatedCategory
      );

      // Invalidate tree and lists
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.tree() });
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.lists() });

      toast.success("Category moved successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to move category");
    },
  });
};

// Upload Category Image
export const useUploadCategoryImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      imageFile,
    }: {
      categoryId: string;
      imageFile: File;
    }) => categoryService.uploadCategoryImage(categoryId, imageFile),
    onSuccess: (result, { categoryId }) => {
      // Invalidate category detail to refetch with new image
      queryClient.invalidateQueries({
        queryKey: CATEGORY_QUERY_KEYS.detail(categoryId),
      });

      toast.success("Category image uploaded successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to upload category image"
      );
    },
  });
};

// Validate Category Move
export const useValidateCategoryMove = () => {
  return useMutation({
    mutationFn: ({
      categoryId,
      newParentId,
    }: {
      categoryId: string;
      newParentId: string | null;
    }) => categoryService.validateCategoryMove(categoryId, newParentId),
  });
};
