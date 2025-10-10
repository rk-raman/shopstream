import { DEFAULT_PRICE_RANGE } from "./constants";
import { SortOption, FilterState, Product } from "./types";

export class URLBuilder {
  static buildQueryString(
    filters: FilterState,
    sortBy: string,
    currentPage: number
  ): string {
    const params: string[] = [];

    if (filters.categories.length > 0) {
      params.push(`category=${filters.categories.join(",")}`);
    }
    if (filters.brands.length > 0) {
      params.push(`brand=${filters.brands.join(",")}`);
    }
    if (
      filters.priceRange[0] > 0 ||
      filters.priceRange[1] < DEFAULT_PRICE_RANGE[1]
    ) {
      params.push(`price=${filters.priceRange[0]}-${filters.priceRange[1]}`);
    }
    if (filters.minRating > 0) {
      params.push(`rating=${filters.minRating}+`);
    }
    if (sortBy !== "popularity") {
      params.push(`sort=${sortBy}`);
    }
    if (currentPage > 1) {
      params.push(`page=${currentPage}`);
    }

    return params.length > 0 ? `?${params.join("&")}` : "";
  }
}

// utils/filter.utils.ts
export class FilterUtils {
  static applyFilters(products: Product[], filters: FilterState): Product[] {
    let filtered = [...products];

    if (filters.categories.length > 0) {
      filtered = filtered.filter((p) =>
        filters.categories.includes(p.category)
      );
    }

    if (filters.brands.length > 0) {
      filtered = filtered.filter((p) => filters.brands.includes(p.brand));
    }

    filtered = filtered.filter(
      (p) =>
        p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    if (filters.minRating > 0) {
      filtered = filtered.filter((p) => p.rating >= filters.minRating);
    }

    return filtered;
  }

  static getActiveFiltersCount(filters: FilterState): number {
    return (
      filters.categories.length +
      filters.brands.length +
      (filters.priceRange[0] > 0 ||
      filters.priceRange[1] < DEFAULT_PRICE_RANGE[1]
        ? 1
        : 0) +
      (filters.minRating > 0 ? 1 : 0)
    );
  }
}

// utils/sort.utils.ts
export class SortUtils {
  static sortProducts(products: Product[], sortBy: string): Product[] {
    const sorted = [...products];

    switch (sortBy) {
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price);
      case "rating":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "newest":
        return sorted.sort((a, b) => b.id - a.id);
      default:
        return sorted;
    }
  }
}

// utils/pagination.utils.ts
export class PaginationUtils {
  static paginate<T>(items: T[], page: number, perPage: number): T[] {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return items.slice(start, end);
  }

  static getTotalPages(totalItems: number, perPage: number): number {
    return Math.ceil(totalItems / perPage);
  }

  static getPageNumbers(
    currentPage: number,
    totalPages: number,
    maxVisible: number = 5
  ): number[] {
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return Array.from({ length: maxVisible }, (_, i) => i + 1);
    }

    if (currentPage >= totalPages - 2) {
      return Array.from(
        { length: maxVisible },
        (_, i) => totalPages - maxVisible + i + 1
      );
    }

    return Array.from({ length: maxVisible }, (_, i) => currentPage - 2 + i);
  }
}
