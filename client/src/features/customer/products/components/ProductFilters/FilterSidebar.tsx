import React from "react";
import { SlidersHorizontal } from "lucide-react";
import { FilterState } from "../../types";

interface FilterSidebarProps {
  categories: string[];
  brands: string[];
  filters: FilterState;
  onCategoryToggle: (category: string) => void;
  onBrandToggle: (brand: string) => void;
  onPriceRangeChange: (range: [number, number]) => void;
  onMinRatingChange: (rating: number) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  brands,
  filters,
  onCategoryToggle,
  onBrandToggle,
  onPriceRangeChange,
  onMinRatingChange,
  onClearFilters,
  activeFiltersCount,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          <SlidersHorizontal size={18} />
          Filters
        </h2>
        {activeFiltersCount > 0 && (
          <button
            onClick={onClearFilters}
            className="text-xs text-blue-600 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Category</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <label
              key={category}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={filters.categories.includes(category)}
                onChange={() => onCategoryToggle(category)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">{category}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
        <div className="space-y-3">
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={filters.priceRange[0]}
              onChange={(e) =>
                onPriceRangeChange([
                  parseInt(e.target.value) || 0,
                  filters.priceRange[1],
                ])
              }
              className="w-20 px-2 py-1 border rounded text-sm"
              placeholder="Min"
            />
            <span className="text-gray-500">to</span>
            <input
              type="number"
              value={filters.priceRange[1]}
              onChange={(e) =>
                onPriceRangeChange([
                  filters.priceRange[0],
                  parseInt(e.target.value) || 2000,
                ])
              }
              className="w-20 px-2 py-1 border rounded text-sm"
              placeholder="Max"
            />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Brand</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {brands.map((brand) => (
            <label
              key={brand}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={filters.brands.includes(brand)}
                onChange={() => onBrandToggle(brand)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Rating</h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <label
              key={rating}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="rating"
                checked={filters.minRating === rating}
                onChange={() => onMinRatingChange(rating)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">{rating}★ & above</span>
            </label>
          ))}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="rating"
              checked={filters.minRating === 0}
              onChange={() => onMinRatingChange(0)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">All ratings</span>
          </label>
        </div>
      </div>
    </div>
  );
};
