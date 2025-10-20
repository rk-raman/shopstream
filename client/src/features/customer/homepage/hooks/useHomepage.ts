"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getFeatureProducts,
  getCategories,
} from "../../services/productService";

// Query Keys
export const PRODUCT_QUERY_KEYS = {
  featureProducts: ["featureProducts"] as const,
  getCategories: ["getCategories"] as const,
};

export const useFeatureProducts = (limit: any = 4) => {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.featureProducts,
    queryFn: () => getFeatureProducts(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGetCategories = (limit: any = 4) => {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.getCategories,
    queryFn: () => getCategories(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
