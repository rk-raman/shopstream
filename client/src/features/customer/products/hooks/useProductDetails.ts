";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getFeatureProducts,
  getCategories,
  getProductById
} from "../../services/productService";

// Query Keys
export const PRODUCT_QUERY_KEYS = {
  useProductDetails: ["useProductDetails"] as const,
};

export const useProductDetails = (id: any ) => {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.useProductDetails,
    queryFn: () => getProductById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

