import { useState, useCallback } from "react";
import { DEFAULT_PRICE_RANGE } from "../constants";
import { FilterState } from "../types";

export const useProductFilters = () => {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    brands: [],
    priceRange: DEFAULT_PRICE_RANGE,
    minRating: 0,
    search: "",
  });

  const toggleCategory = useCallback((category: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  }, []);

  const toggleBrand = useCallback((brand: string) => {
    setFilters((prev) => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter((b) => b !== brand)
        : [...prev.brands, brand],
    }));
  }, []);

  const setPriceRange = useCallback((range: [number, number]) => {
    setFilters((prev) => ({ ...prev, priceRange: range }));
  }, []);

  const setMinRating = useCallback((rating: number) => {
    setFilters((prev) => ({ ...prev, minRating: rating }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      categories: [],
      brands: [],
      priceRange: DEFAULT_PRICE_RANGE,
      minRating: 0,
      search: "",
    });
  }, []);

  const removeCategory = useCallback((category: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== category),
    }));
  }, []);

  const removeBrand = useCallback((brand: string) => {
    setFilters((prev) => ({
      ...prev,
      brands: prev.brands.filter((b) => b !== brand),
    }));
  }, []);

  return {
    filters,
    toggleCategory,
    toggleBrand,
    setPriceRange,
    setMinRating,
    setSearch,
    clearFilters,
    removeCategory,
    removeBrand,
  };
};
