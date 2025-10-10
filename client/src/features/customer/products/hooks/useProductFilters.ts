import { useState } from "react";
import { DEFAULT_PRICE_RANGE } from "../constants";
import { SortOption, FilterState, Product } from "../types";

export const useProductFilters = () => {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    brands: [],
    priceRange: DEFAULT_PRICE_RANGE,
    minRating: 0,
  });

  const toggleCategory = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const toggleBrand = (brand: string) => {
    setFilters((prev) => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter((b) => b !== brand)
        : [...prev.brands, brand],
    }));
  };

  const setPriceRange = (range: [number, number]) => {
    setFilters((prev) => ({ ...prev, priceRange: range }));
  };

  const setMinRating = (rating: number) => {
    setFilters((prev) => ({ ...prev, minRating: rating }));
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      brands: [],
      priceRange: DEFAULT_PRICE_RANGE,
      minRating: 0,
    });
  };

  const removeCategory = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== category),
    }));
  };

  const removeBrand = (brand: string) => {
    setFilters((prev) => ({
      ...prev,
      brands: prev.brands.filter((b) => b !== brand),
    }));
  };

  return {
    filters,
    toggleCategory,
    toggleBrand,
    setPriceRange,
    setMinRating,
    clearFilters,
    removeCategory,
    removeBrand,
  };
};
