import React from "react";
import { SlidersHorizontal, Grid, List } from "lucide-react";
import { SortOption } from "../../types";

interface ToolbarProps {
  showFilters: boolean;
  onToggleFilters: () => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  view: "grid" | "list";
  onViewChange: (view: "grid" | "list") => void;
  sortOptions: SortOption[];
}

export const Toolbar: React.FC<ToolbarProps> = ({
  showFilters,
  onToggleFilters,
  sortBy,
  onSortChange,
  view,
  onViewChange,
  sortOptions,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex items-center justify-between">
      <button
        onClick={onToggleFilters}
        className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
      >
        <SlidersHorizontal size={18} />
        {showFilters ? "Hide" : "Show"} Filters
      </button>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => onViewChange("grid")}
            className={`p-2 rounded ${
              view === "grid"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => onViewChange("list")}
            className={`p-2 rounded ${
              view === "list"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
          >
            <List size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
