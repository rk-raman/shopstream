import React from "react";
import { X } from "lucide-react";
import { FilterState } from "../../types";

interface ActiveFiltersProps {
  filters: FilterState;
  onRemoveCategory: (category: string) => void;
  onRemoveBrand: (brand: string) => void;
}

export const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  filters,
  onRemoveCategory,
  onRemoveBrand,
}) => {
  const hasActiveFilters =
    filters.categories.length > 0 || filters.brands.length > 0;

  if (!hasActiveFilters) return null;

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {filters.categories.map((cat) => (
        <span
          key={cat}
          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
        >
          {cat}
          <button onClick={() => onRemoveCategory(cat)}>
            <X size={14} />
          </button>
        </span>
      ))}
      {filters.brands.map((brand) => (
        <span
          key={brand}
          className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
        >
          {brand}
          <button onClick={() => onRemoveBrand(brand)}>
            <X size={14} />
          </button>
        </span>
      ))}
    </div>
  );
};
