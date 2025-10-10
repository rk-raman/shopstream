import { DEFAULT_PRICE_RANGE } from "../constants";
import { SortOption, FilterState, Product } from "../types";
import { useMemo } from "react";
import { FilterUtils, PaginationUtils, SortUtils } from "../utils";

export const useProductList = (
  products: Product[],
  filters: FilterState,
  sortBy: string,
  currentPage: number,
  itemsPerPage: number
) => {
  const filteredProducts = useMemo(
    () => FilterUtils.applyFilters(products, filters),
    [products, filters]
  );

  const sortedProducts = useMemo(
    () => SortUtils.sortProducts(filteredProducts, sortBy),
    [filteredProducts, sortBy]
  );

  const paginatedProducts = useMemo(
    () => PaginationUtils.paginate(sortedProducts, currentPage, itemsPerPage),
    [sortedProducts, currentPage, itemsPerPage]
  );

  const totalPages = useMemo(
    () => PaginationUtils.getTotalPages(sortedProducts.length, itemsPerPage),
    [sortedProducts.length, itemsPerPage]
  );

  return {
    filteredProducts,
    sortedProducts,
    paginatedProducts,
    totalPages,
    totalItems: sortedProducts.length,
  };
};
