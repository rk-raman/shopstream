"use client";

import React, { useState } from "react";
import { ChevronRight, ChevronDown, FolderTree, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCategoryTree } from "@/features/seller/hooks/useCategories";
import { Category } from "@/types/global";

interface CategoryNavigationProps {
  selectedCategoryId?: string;
  onCategorySelect: (categoryId: string | null) => void;
  showProductCount?: boolean;
  className?: string;
}

interface CategoryNodeProps {
  category: Category;
  selectedCategoryId?: string;
  onCategorySelect: (categoryId: string | null) => void;
  showProductCount?: boolean;
  level?: number;
}

const CategoryNode: React.FC<CategoryNodeProps> = ({
  category,
  selectedCategoryId,
  onCategorySelect,
  showProductCount = true,
  level = 0,
}) => {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first 2 levels
  const hasChildren = category.children && category.children.length > 0;
  const isSelected = selectedCategoryId === category._id;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleSelect = () => {
    onCategorySelect(isSelected ? null : category._id);
  };

  return (
    <div className="w-full">
      <div
        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
          isSelected ? "bg-blue-50 border border-blue-200" : ""
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleSelect}
      >
        {hasChildren ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={handleToggle}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        ) : (
          <div className="w-4" />
        )}

        <div className="flex items-center gap-2 flex-1 min-w-0">
          {category.icon ? (
            <span className="text-sm flex-shrink-0">{category.icon}</span>
          ) : (
            <Package className="h-4 w-4 text-gray-400 flex-shrink-0" />
          )}

          <span
            className={`text-sm truncate ${
              isSelected ? "font-medium text-blue-700" : "text-gray-700"
            }`}
          >
            {category.name}
          </span>

          <div className="flex items-center gap-1 flex-shrink-0">
            {!category.isActive && (
              <Badge variant="secondary" className="text-xs">
                Inactive
              </Badge>
            )}

            {category.isFeatured && (
              <Badge variant="outline" className="text-xs">
                Featured
              </Badge>
            )}

            {showProductCount && category.productCount !== undefined && (
              <Badge variant="secondary" className="text-xs">
                {category.productCount}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-1">
          {category.children!.map((child) => (
            <CategoryNode
              key={child._id}
              category={child}
              selectedCategoryId={selectedCategoryId}
              onCategorySelect={onCategorySelect}
              showProductCount={showProductCount}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CategoryNavigation: React.FC<CategoryNavigationProps> = ({
  selectedCategoryId,
  onCategorySelect,
  showProductCount = true,
  className = "",
}) => {
  const { data: categoryTree, isLoading, error } = useCategoryTree();

  const handleClearSelection = () => {
    onCategorySelect(null);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-2 p-2">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 flex-1 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">Failed to load categories</p>
        </CardContent>
      </Card>
    );
  }

  if (!categoryTree || categoryTree.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No categories available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            Categories
          </CardTitle>
          {selectedCategoryId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSelection}
              className="text-xs"
            >
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          <div
            className={`flex items-center gap-2 p-3 cursor-pointer transition-colors hover:bg-gray-50 border-b ${
              !selectedCategoryId ? "bg-blue-50 border-blue-200" : ""
            }`}
            onClick={() => onCategorySelect(null)}
          >
            <Package className="h-4 w-4 text-gray-400" />
            <span
              className={`text-sm ${
                !selectedCategoryId
                  ? "font-medium text-blue-700"
                  : "text-gray-700"
              }`}
            >
              All Products
            </span>
          </div>

          <div className="p-2">
            {categoryTree.map((category) => (
              <CategoryNode
                key={category._id}
                category={category}
                selectedCategoryId={selectedCategoryId}
                onCategorySelect={onCategorySelect}
                showProductCount={showProductCount}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
