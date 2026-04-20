"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Loader2 } from "lucide-react";
import { useProductFilters } from "../../hooks/useProductFilters";
import { Product, normalizeProduct } from "../../types";
import { ITEMS_PER_PAGE, SORT_OPTIONS, DEFAULT_PRICE_RANGE } from "../../constants";
import { FilterSidebar } from "../ProductFilters/FilterSidebar";
import { Toolbar } from "../ProductFilters/Toolbar";
import { Pagination } from "../ProductFilters/Pagination";
import { ActiveFilters } from "../ProductFilters/ActiveFilters";
import { ProductCard } from "../ProductCard/ProductCard";
import { FilterUtils } from "../../utils";
import {
  getProducts,
  getCategories,
} from "@/features/customer/services/productService";
import { useWishlist } from "@/features/customer/account/wishlist/useWishlist";

export default function ProductListingContainer() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const { wishlistItems, toggleWishlist } = useWishlist();
  const wishlistIds = new Set(wishlistItems.map((w) => w.productId));

  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter options from API
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [brandOptions, setBrandOptions] = useState<string[]>([]);

  const filterHook = useProductFilters();
  const { filters } = filterHook;

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(filters.search), 400);
    return () => clearTimeout(timer);
  }, [filters.search]);

  // Fetch categories for sidebar
  useEffect(() => {
    getCategories()
      .then((res) => {
        if (res.success && res.data) {
          const cats = Array.isArray(res.data)
            ? res.data
            : res.data.categories || [];
          setCategoryOptions(cats.map((c: any) => c.name || c));
        }
      })
      .catch(() => {});
  }, []);

  // Map sort value to API params
  const getSortParams = (sort: string) => {
    switch (sort) {
      case "price-low":
        return { sortBy: "basePrice" as const, sortOrder: "asc" as const };
      case "price-high":
        return { sortBy: "basePrice" as const, sortOrder: "desc" as const };
      case "rating":
        return { sortBy: "rating.average" as const, sortOrder: "desc" as const };
      case "newest":
        return { sortBy: "createdAt" as const, sortOrder: "desc" as const };
      case "popularity":
      default:
        return { sortBy: "salesCount" as const, sortOrder: "desc" as const };
    }
  };

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const sortParams = getSortParams(sortBy);
      const apiFilters: any = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        status: "active",
        ...sortParams,
      };

      if (debouncedSearch) apiFilters.search = debouncedSearch;
      if (filters.categories.length === 1)
        apiFilters.category = filters.categories[0];
      if (filters.brands.length === 1) apiFilters.brand = filters.brands[0];
      if (filters.priceRange[0] > DEFAULT_PRICE_RANGE[0])
        apiFilters.minPrice = filters.priceRange[0];
      if (filters.priceRange[1] < DEFAULT_PRICE_RANGE[1])
        apiFilters.maxPrice = filters.priceRange[1];

      const response = await getProducts(apiFilters);

      if (response.success) {
        // API shape: data = product array, meta.pagination = page info
        const rawData = response.data as any;
        const docs = Array.isArray(rawData)
          ? rawData
          : rawData?.docs || [];
        const pagination = (response as any).meta?.pagination || {};
        const normalized = docs.map(normalizeProduct);

        // Extract brands from results for sidebar
        const uniqueBrands = [
          ...new Set(
            normalized
              .map((p: Product) =>
                typeof p.brand === "object" ? p.brand?.name : p.brand
              )
              .filter(Boolean)
          ),
        ] as string[];
        if (uniqueBrands.length > 0) setBrandOptions(uniqueBrands);

        setProducts(normalized);
        setTotalPages(pagination.totalPages || 1);
        setTotalItems(pagination.totalResults || docs.length);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, sortBy, debouncedSearch, filters.categories, filters.brands, filters.priceRange]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset page when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filters.categories, filters.brands, filters.priceRange, filters.minRating, sortBy]);

  const activeFiltersCount = FilterUtils.getActiveFiltersCount(filters);

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  // Client-side filter for multi-select categories/brands and rating
  // (API only supports single category/brand, so multi-select is client-side)
  let displayProducts = products;
  if (filters.categories.length > 1) {
    displayProducts = displayProducts.filter((p) => {
      const catName = typeof p.category === "object" ? p.category?.name : p.category;
      return filters.categories.includes(catName || "");
    });
  }
  if (filters.brands.length > 1) {
    displayProducts = displayProducts.filter((p) => {
      const brandName = typeof p.brand === "object" ? p.brand?.name : p.brand;
      return filters.brands.includes(brandName || "");
    });
  }
  if (filters.minRating > 0) {
    displayProducts = displayProducts.filter((p) => {
      const r = typeof p.rating === "object" ? p.rating.average : 0;
      return r >= filters.minRating;
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>

            {/* Search */}
            <div className="flex-1 max-w-lg relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => filterHook.setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="text-sm text-gray-600">
              {totalItems} result{totalItems !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          {showFilters && (
            <div className="w-64 flex-shrink-0">
              <FilterSidebar
                categories={categoryOptions}
                brands={brandOptions}
                filters={filters}
                onCategoryToggle={(category) => {
                  filterHook.toggleCategory(category);
                  handleFilterChange();
                }}
                onBrandToggle={(brand) => {
                  filterHook.toggleBrand(brand);
                  handleFilterChange();
                }}
                onPriceRangeChange={(range) => {
                  filterHook.setPriceRange(range);
                  handleFilterChange();
                }}
                onMinRatingChange={(rating) => {
                  filterHook.setMinRating(rating);
                  handleFilterChange();
                }}
                onClearFilters={() => {
                  filterHook.clearFilters();
                  handleFilterChange();
                }}
                activeFiltersCount={activeFiltersCount}
              />
            </div>
          )}

          {/* Main content */}
          <div className="flex-1">
            <Toolbar
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
              sortBy={sortBy}
              onSortChange={handleSortChange}
              view={view}
              onViewChange={setView}
              sortOptions={SORT_OPTIONS}
            />

            <ActiveFilters
              filters={filters}
              onRemoveCategory={(category) => {
                filterHook.removeCategory(category);
                handleFilterChange();
              }}
              onRemoveBrand={(brand) => {
                filterHook.removeBrand(brand);
                handleFilterChange();
              }}
            />

            {/* Loading */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : error ? (
              <div className="text-center py-16 bg-white rounded-lg">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={fetchProducts}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Retry
                </button>
              </div>
            ) : displayProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg">
                <p className="text-gray-500 text-lg mb-2">No products found</p>
                <p className="text-gray-400 text-sm">
                  Try adjusting your filters or search term
                </p>
              </div>
            ) : (
              <>
                <div
                  className={
                    view === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                      : "space-y-4"
                  }
                >
                  {displayProducts.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      view={view}
                      isWishlisted={wishlistIds.has(product._id)}
                      onToggleWishlist={toggleWishlist}
                    />
                  ))}
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
