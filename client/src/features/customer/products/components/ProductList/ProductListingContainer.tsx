import React, { useState, useMemo } from "react";
import { useProductFilters } from "../../hooks/useProductFilters";
import { Product } from "../../types";
import { useProductList } from "../../hooks/useProductList";
import { ITEMS_PER_PAGE, SORT_OPTIONS } from "../../constants";
import { FilterSidebar } from "../ProductFilters/FilterSidebar";
import { Toolbar } from "../ProductFilters/Toolbar";
import { Pagination } from "../ProductFilters/Pagination";
import { ActiveFilters } from "../ProductFilters/ActiveFilters";
import { ProductCard } from "../ProductCard/ProductCard";
import { FilterUtils, URLBuilder } from "../../utils";

// Mock data generator
const generateMockProducts = (count: number = 50): Product[] => {
  const categories = ["Electronics", "Fashion", "Home", "Books", "Sports"];
  const brands = ["Samsung", "Apple", "Nike", "Adidas", "Sony", "LG", "Puma"];
  const products: Product[] = [];

  for (let i = 1; i <= count; i++) {
    products.push({
      id: i,
      name: `Product ${i}`,
      description: `High quality product with amazing features`,
      price: Math.floor(Math.random() * 900) + 100,
      originalPrice: Math.floor(Math.random() * 1200) + 1000,
      rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
      reviews: Math.floor(Math.random() * 500) + 10,
      category: categories[Math.floor(Math.random() * categories.length)],
      brand: brands[Math.floor(Math.random() * brands.length)],
      inStock: Math.random() > 0.2,
      image: `https://images.unsplash.com/photo-${1500000000000 + i}?w=400`,
    });
  }
  return products;
};

export default function ProductListingContainer() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("popularity");

  const products = useMemo(() => generateMockProducts(), []);
  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))],
    [products]
  );
  const brands = useMemo(
    () => [...new Set(products.map((p) => p.brand))],
    [products]
  );

  const filterHook = useProductFilters();
  const { filters } = filterHook;

  const productList = useProductList(
    products,
    filters,
    sortBy,
    currentPage,
    ITEMS_PER_PAGE
  );

  const activeFiltersCount = FilterUtils.getActiveFiltersCount(filters);
  const queryString = URLBuilder.buildQueryString(filters, sortBy, currentPage);

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <div className="text-sm text-gray-600">
              {productList.totalItems} results
            </div>
          </div>

          <div className="mt-2 p-2 bg-blue-50 rounded text-xs font-mono text-blue-800 overflow-x-auto">
            /products{queryString}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {showFilters && (
            <div className="w-64 flex-shrink-0">
              <FilterSidebar
                categories={categories}
                brands={brands}
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

            {productList.paginatedProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg">
                <p className="text-gray-500">No products found</p>
              </div>
            ) : (
              <>
                <div
                  className={
                    view === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      : "space-y-4"
                  }
                >
                  {productList.paginatedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      view={view}
                    />
                  ))}
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={productList.totalPages}
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
