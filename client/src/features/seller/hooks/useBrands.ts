import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as brandService from "../services/brandService";
import { Brand, BrandFormData } from "@/types/global";

// Query Keys
export const BRAND_QUERY_KEYS = {
  all: ["brands"] as const,
  lists: () => [...BRAND_QUERY_KEYS.all, "list"] as const,
  list: (filters: any) => [...BRAND_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...BRAND_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...BRAND_QUERY_KEYS.details(), id] as const,
  active: () => [...BRAND_QUERY_KEYS.all, "active"] as const,
  featured: () => [...BRAND_QUERY_KEYS.all, "featured"] as const,
  verified: () => [...BRAND_QUERY_KEYS.all, "verified"] as const,
  popular: (limit?: number) =>
    [...BRAND_QUERY_KEYS.all, "popular", limit] as const,
  category: (categoryId: string) =>
    [...BRAND_QUERY_KEYS.all, "category", categoryId] as const,
  alphabet: () => [...BRAND_QUERY_KEYS.all, "alphabet"] as const,
  search: (term: string) => [...BRAND_QUERY_KEYS.all, "search", term] as const,
  statistics: () => [...BRAND_QUERY_KEYS.all, "statistics"] as const,
  products: (brandId: string, filters?: any) =>
    [...BRAND_QUERY_KEYS.all, "products", brandId, filters] as const,
  topProducts: (brandId: string, limit?: number) =>
    [...BRAND_QUERY_KEYS.all, "top-products", brandId, limit] as const,
  followers: (brandId: string, filters?: any) =>
    [...BRAND_QUERY_KEYS.all, "followers", brandId, filters] as const,
};

// Get Brands
export const useBrands = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  isVerified?: boolean;
  sortBy?: "name" | "productCount" | "viewCount" | "createdAt";
  sortOrder?: "asc" | "desc";
}) => {
  return useQuery({
    queryKey: BRAND_QUERY_KEYS.list(params),
    queryFn: () => brandService.getBrands(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get Active Brands
export const useActiveBrands = () => {
  return useQuery({
    queryKey: BRAND_QUERY_KEYS.active(),
    queryFn: brandService.getActiveBrands,
    staleTime: 10 * 60 * 1000,
  });
};

// Get Featured Brands
export const useFeaturedBrands = () => {
  return useQuery({
    queryKey: BRAND_QUERY_KEYS.featured(),
    queryFn: brandService.getFeaturedBrands,
    staleTime: 10 * 60 * 1000,
  });
};

// Get Verified Brands
export const useVerifiedBrands = () => {
  return useQuery({
    queryKey: BRAND_QUERY_KEYS.verified(),
    queryFn: brandService.getVerifiedBrands,
    staleTime: 10 * 60 * 1000,
  });
};

// Get Popular Brands
export const usePopularBrands = (limit?: number) => {
  return useQuery({
    queryKey: BRAND_QUERY_KEYS.popular(limit),
    queryFn: () => brandService.getPopularBrands(limit),
    staleTime: 15 * 60 * 1000,
  });
};

// Get Brands by Category
export const useBrandsByCategory = (categoryId: string) => {
  return useQuery({
    queryKey: BRAND_QUERY_KEYS.category(categoryId),
    queryFn: () => brandService.getBrandsByCategory(categoryId),
    enabled: !!categoryId,
    staleTime: 10 * 60 * 1000,
  });
};

// Get Brands by Alphabet
export const useBrandsByAlphabet = () => {
  return useQuery({
    queryKey: BRAND_QUERY_KEYS.alphabet(),
    queryFn: brandService.getBrandsByAlphabet,
    staleTime: 15 * 60 * 1000,
  });
};

// Get Single Brand
export const useBrand = (id: string) => {
  return useQuery({
    queryKey: BRAND_QUERY_KEYS.detail(id),
    queryFn: () => brandService.getBrand(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Search Brands
export const useSearchBrands = (searchTerm: string) => {
  return useQuery({
    queryKey: BRAND_QUERY_KEYS.search(searchTerm),
    queryFn: () => brandService.searchBrands(searchTerm),
    enabled: !!searchTerm && searchTerm.length > 2,
    staleTime: 2 * 60 * 1000,
  });
};

// Get Brand Statistics
export const useBrandStatistics = () => {
  return useQuery({
    queryKey: BRAND_QUERY_KEYS.statistics(),
    queryFn: brandService.getBrandStatistics,
    staleTime: 15 * 60 * 1000,
  });
};

// Get Brand Products
export const useBrandProducts = (
  brandId: string,
  params?: {
    page?: number;
    limit?: number;
    category?: string;
  }
) => {
  return useQuery({
    queryKey: BRAND_QUERY_KEYS.products(brandId, params),
    queryFn: () => brandService.getBrandProducts(brandId, params),
    enabled: !!brandId,
    staleTime: 5 * 60 * 1000,
  });
};

// Get Brand Top Products
export const useBrandTopProducts = (brandId: string, limit?: number) => {
  return useQuery({
    queryKey: BRAND_QUERY_KEYS.topProducts(brandId, limit),
    queryFn: () => brandService.getBrandTopProducts(brandId, limit),
    enabled: !!brandId,
    staleTime: 10 * 60 * 1000,
  });
};

// Get Brand Followers
export const useBrandFollowers = (
  brandId: string,
  params?: {
    page?: number;
    limit?: number;
  }
) => {
  return useQuery({
    queryKey: BRAND_QUERY_KEYS.followers(brandId, params),
    queryFn: () => brandService.getBrandFollowers(brandId, params),
    enabled: !!brandId,
    staleTime: 5 * 60 * 1000,
  });
};

// Create Brand
export const useCreateBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: brandService.createBrand,
    onSuccess: (newBrand) => {
      // Invalidate and refetch brands
      queryClient.invalidateQueries({ queryKey: BRAND_QUERY_KEYS.all });

      // Add to cache
      queryClient.setQueryData(BRAND_QUERY_KEYS.detail(newBrand._id), newBrand);

      toast.success("Brand created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create brand");
    },
  });
};

// Update Brand
export const useUpdateBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BrandFormData> }) =>
      brandService.updateBrand(id, data),
    onSuccess: (updatedBrand) => {
      // Update cache
      queryClient.setQueryData(
        BRAND_QUERY_KEYS.detail(updatedBrand._id),
        updatedBrand
      );

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: BRAND_QUERY_KEYS.lists() });

      toast.success("Brand updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update brand");
    },
  });
};

// Delete Brand
export const useDeleteBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: brandService.deleteBrand,
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: BRAND_QUERY_KEYS.detail(deletedId),
      });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: BRAND_QUERY_KEYS.all });

      toast.success("Brand deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete brand");
    },
  });
};

// Bulk Delete Brands
export const useBulkDeleteBrands = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: brandService.bulkDeleteBrands,
    onSuccess: (_, deletedIds) => {
      // Remove from cache
      deletedIds.forEach((id) => {
        queryClient.removeQueries({ queryKey: BRAND_QUERY_KEYS.detail(id) });
      });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: BRAND_QUERY_KEYS.all });

      toast.success(`${deletedIds.length} brands deleted successfully`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete brands");
    },
  });
};

// Update Brand Status
export const useUpdateBrandStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      brandService.updateBrandStatus(id, isActive),
    onSuccess: (updatedBrand) => {
      // Update cache
      queryClient.setQueryData(
        BRAND_QUERY_KEYS.detail(updatedBrand._id),
        updatedBrand
      );

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: BRAND_QUERY_KEYS.lists() });

      toast.success(
        `Brand ${
          updatedBrand.isActive ? "activated" : "deactivated"
        } successfully`
      );
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update brand status"
      );
    },
  });
};

// Toggle Featured Status
export const useToggleBrandFeatured = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isFeatured }: { id: string; isFeatured: boolean }) =>
      brandService.toggleBrandFeatured(id, isFeatured),
    onSuccess: (updatedBrand) => {
      // Update cache
      queryClient.setQueryData(
        BRAND_QUERY_KEYS.detail(updatedBrand._id),
        updatedBrand
      );

      // Invalidate featured list
      queryClient.invalidateQueries({ queryKey: BRAND_QUERY_KEYS.featured() });
      queryClient.invalidateQueries({ queryKey: BRAND_QUERY_KEYS.lists() });

      toast.success(
        `Brand ${
          updatedBrand.isFeatured ? "featured" : "unfeatured"
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

// Toggle Verified Status
export const useToggleBrandVerified = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isVerified }: { id: string; isVerified: boolean }) =>
      brandService.toggleBrandVerified(id, isVerified),
    onSuccess: (updatedBrand) => {
      // Update cache
      queryClient.setQueryData(
        BRAND_QUERY_KEYS.detail(updatedBrand._id),
        updatedBrand
      );

      // Invalidate verified list
      queryClient.invalidateQueries({ queryKey: BRAND_QUERY_KEYS.verified() });
      queryClient.invalidateQueries({ queryKey: BRAND_QUERY_KEYS.lists() });

      toast.success(
        `Brand ${
          updatedBrand.isVerified ? "verified" : "unverified"
        } successfully`
      );
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update verified status"
      );
    },
  });
};

// Upload Brand Logo
export const useUploadBrandLogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ brandId, logoFile }: { brandId: string; logoFile: File }) =>
      brandService.uploadBrandLogo(brandId, logoFile),
    onSuccess: (result, { brandId }) => {
      // Invalidate brand detail to refetch with new logo
      queryClient.invalidateQueries({
        queryKey: BRAND_QUERY_KEYS.detail(brandId),
      });

      toast.success("Brand logo uploaded successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to upload brand logo"
      );
    },
  });
};

// Upload Brand Banner
export const useUploadBrandBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      brandId,
      bannerFile,
    }: {
      brandId: string;
      bannerFile: File;
    }) => brandService.uploadBrandBanner(brandId, bannerFile),
    onSuccess: (result, { brandId }) => {
      // Invalidate brand detail to refetch with new banner
      queryClient.invalidateQueries({
        queryKey: BRAND_QUERY_KEYS.detail(brandId),
      });

      toast.success("Brand banner uploaded successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to upload brand banner"
      );
    },
  });
};

// Upload Brand Images
export const useUploadBrandImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      brandId,
      imageFiles,
    }: {
      brandId: string;
      imageFiles: File[];
    }) => brandService.uploadBrandImages(brandId, imageFiles),
    onSuccess: (result, { brandId }) => {
      // Invalidate brand detail to refetch with new images
      queryClient.invalidateQueries({
        queryKey: BRAND_QUERY_KEYS.detail(brandId),
      });

      toast.success("Brand images uploaded successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to upload brand images"
      );
    },
  });
};

// Toggle Brand Follow
export const useToggleBrandFollow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ brandId, follow }: { brandId: string; follow: boolean }) =>
      brandService.toggleBrandFollow(brandId, follow),
    onSuccess: (result, { brandId, follow }) => {
      // Update brand cache with new follower count
      queryClient.setQueryData(
        BRAND_QUERY_KEYS.detail(brandId),
        (oldData: Brand | undefined) => {
          if (oldData) {
            return { ...oldData, followerCount: result.followerCount };
          }
          return oldData;
        }
      );

      // Invalidate followers list
      queryClient.invalidateQueries({
        queryKey: BRAND_QUERY_KEYS.followers(brandId),
      });

      toast.success(`Brand ${follow ? "followed" : "unfollowed"} successfully`);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update follow status"
      );
    },
  });
};

// Update Brand Categories
export const useUpdateBrandCategories = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      brandId,
      categoryIds,
    }: {
      brandId: string;
      categoryIds: string[];
    }) => brandService.updateBrandCategories(brandId, categoryIds),
    onSuccess: (updatedBrand) => {
      // Update cache
      queryClient.setQueryData(
        BRAND_QUERY_KEYS.detail(updatedBrand._id),
        updatedBrand
      );

      // Invalidate category-based queries
      queryClient.invalidateQueries({ queryKey: BRAND_QUERY_KEYS.lists() });

      toast.success("Brand categories updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update brand categories"
      );
    },
  });
};
