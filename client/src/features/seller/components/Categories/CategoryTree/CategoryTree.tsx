import React, { useState, useCallback } from "react";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  MoreHorizontal,
  Image,
  Move,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { CategoryTree as CategoryTreeType, Category } from "@/types/global";
import {
  useCategoryTree,
  useUpdateCategory,
  useDeleteCategory,
  useUpdateCategoryStatus,
  useToggleCategoryFeatured,
  useMoveCategoryToParent,
} from "@/features/seller/hooks/useCategories";

interface CategoryTreeProps {
  onCategorySelect?: (category: Category) => void;
  onCategoryEdit?: (category: Category) => void;
  onCategoryAdd?: (parentId?: string) => void;
  selectedCategoryId?: string;
  showActions?: boolean;
  showProductCount?: boolean;
  maxDepth?: number;
}

interface CategoryNodeProps {
  category: CategoryTreeType;
  level: number;
  maxDepth: number;
  onSelect?: (category: Category) => void;
  onEdit?: (category: Category) => void;
  onAdd?: (parentId?: string) => void;
  selectedId?: string;
  showActions: boolean;
  showProductCount: boolean;
  onMove: (categoryId: string, newParentId: string | null) => void;
}

const CategoryNode: React.FC<CategoryNodeProps> = ({
  category,
  level,
  maxDepth,
  onSelect,
  onEdit,
  onAdd,
  selectedId,
  showActions,
  showProductCount,
  onMove,
}) => {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first 2 levels
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(category.name);
  const [isDragOver, setIsDragOver] = useState(false);

  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const updateStatus = useUpdateCategoryStatus();
  const toggleFeatured = useToggleCategoryFeatured();

  const hasChildren = category.children && category.children.length > 0;
  const canAddChildren = level < maxDepth - 1;

  const handleToggleExpand = useCallback(() => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  }, [hasChildren, isExpanded]);

  const handleSelect = useCallback(() => {
    onSelect?.(category as Category);
  }, [category, onSelect]);

  const handleEdit = useCallback(() => {
    if (isEditing) {
      // Save changes
      if (editName.trim() && editName !== category.name) {
        updateCategory.mutate({
          id: category._id,
          data: { name: editName.trim() },
        });
      }
      setIsEditing(false);
    } else {
      setIsEditing(true);
      setEditName(category.name);
    }
  }, [isEditing, editName, category, updateCategory]);

  const handleDelete = useCallback(() => {
    if (
      window.confirm(
        `Are you sure you want to delete "${category.name}"? This action cannot be undone.`
      )
    ) {
      deleteCategory.mutate(category._id);
    }
  }, [category, deleteCategory]);

  const handleStatusToggle = useCallback(() => {
    updateStatus.mutate({
      id: category._id,
      isActive: !category.isActive,
    });
  }, [category, updateStatus]);

  const handleFeaturedToggle = useCallback(() => {
    toggleFeatured.mutate({
      id: category._id,
      isFeatured: !category.isFeatured,
    });
  }, [category, toggleFeatured]);

  const handleAddChild = useCallback(() => {
    onAdd?.(category._id);
  }, [category._id, onAdd]);

  // Drag and Drop handlers
  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      e.dataTransfer.setData("text/plain", category._id);
      e.dataTransfer.effectAllowed = "move";
    },
    [category._id]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const draggedCategoryId = e.dataTransfer.getData("text/plain");
      if (draggedCategoryId !== category._id) {
        onMove(draggedCategoryId, category._id);
      }
    },
    [category._id, onMove]
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleEdit();
      } else if (e.key === "Escape") {
        setIsEditing(false);
        setEditName(category.name);
      }
    },
    [handleEdit, category.name]
  );

  return (
    <div className="select-none">
      <div
        className={`
          flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors
          ${
            selectedId === category._id
              ? "bg-blue-50 border border-blue-200"
              : ""
          }
          ${isDragOver ? "bg-green-50 border border-green-300" : ""}
          ${!category.isActive ? "opacity-60" : ""}
        `}
        style={{ paddingLeft: `${level * 24 + 8}px` }}
        onClick={handleSelect}
        draggable={showActions}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Expand/Collapse Button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation();
            handleToggleExpand();
          }}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          ) : (
            <div className="h-4 w-4" />
          )}
        </Button>

        {/* Category Icon */}
        <div className="flex-shrink-0">
          {category.image?.url ? (
            <img
              src={category.image.url}
              alt={category.name}
              className="h-6 w-6 rounded object-cover"
            />
          ) : (
            <div className="h-6 w-6 rounded bg-gray-200 flex items-center justify-center text-xs">
              {category.icon || "📦"}
            </div>
          )}
        </div>

        {/* Category Name */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleEdit}
              onKeyDown={handleKeyPress}
              className="h-6 text-sm"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="text-sm font-medium truncate">
              {category.name}
            </span>
          )}
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1">
          {category.isFeatured && (
            <Badge variant="secondary" className="text-xs">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}

          {showProductCount && (
            <Badge variant="outline" className="text-xs">
              {category.productCount || 0} products
            </Badge>
          )}

          {!category.isActive && (
            <Badge variant="destructive" className="text-xs">
              Inactive
            </Badge>
          )}
        </div>

        {/* Actions Menu */}
        {showActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(category as Category)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Details
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>

              {canAddChildren && (
                <DropdownMenuItem onClick={handleAddChild}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subcategory
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleStatusToggle}>
                {category.isActive ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleFeaturedToggle}>
                <Star className="h-4 w-4 mr-2" />
                {category.isFeatured
                  ? "Remove from Featured"
                  : "Mark as Featured"}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="ml-2">
          {category.children?.map((child) => (
            <CategoryNode
              key={child._id}
              category={child}
              level={level + 1}
              maxDepth={maxDepth}
              onSelect={onSelect}
              onEdit={onEdit}
              onAdd={onAdd}
              selectedId={selectedId}
              showActions={showActions}
              showProductCount={showProductCount}
              onMove={onMove}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CategoryTree: React.FC<CategoryTreeProps> = ({
  onCategorySelect,
  onCategoryEdit,
  onCategoryAdd,
  selectedCategoryId,
  showActions = true,
  showProductCount = true,
  maxDepth = 3,
}) => {
  const { data: categoryTree, isLoading, error } = useCategoryTree();
  const moveCategory = useMoveCategoryToParent();

  const handleMove = useCallback(
    (categoryId: string, newParentId: string | null) => {
      moveCategory.mutate({ categoryId, newParentId });
    },
    [moveCategory]
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Failed to load categories. Please try again.
      </div>
    );
  }

  if (!categoryTree || categoryTree.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="mb-4">
          <Image className="h-12 w-12 mx-auto text-gray-300" />
        </div>
        <p className="text-sm">No categories found</p>
        {showActions && (
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => onCategoryAdd?.()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create First Category
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {categoryTree.map((category) => (
        <CategoryNode
          key={category._id}
          category={category}
          level={0}
          maxDepth={maxDepth}
          onSelect={onCategorySelect}
          onEdit={onCategoryEdit}
          onAdd={onCategoryAdd}
          selectedId={selectedCategoryId}
          showActions={showActions}
          showProductCount={showProductCount}
          onMove={handleMove}
        />
      ))}

      {showActions && (
        <div className="pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCategoryAdd?.()}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Root Category
          </Button>
        </div>
      )}
    </div>
  );
};
