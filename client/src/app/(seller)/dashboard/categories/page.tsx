"use client";

import React, { useState } from "react";
import {
  Plus,
  Settings,
  BarChart3,
  FolderTree,
  List,
  Grid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CategoryTree } from "@/features/seller/components/Categories/CategoryTree/CategoryTree";
import { useCategoryStatistics } from "@/features/seller/hooks/useCategories";
import { Category } from "@/types/global";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category;
  parentId?: string;
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  category,
  parentId,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {category ? "Edit Category" : "Create Category"}
          </DialogTitle>
        </DialogHeader>
        <div className="p-6">
          {/* Category form will be implemented here */}
          <p className="text-gray-500">
            Category form component will be implemented here...
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const CategoryStatistics: React.FC = () => {
  const { data: stats, isLoading } = useCategoryStatistics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Categories
              </p>
              <p className="text-2xl font-bold">
                {stats?.totalCategories || 0}
              </p>
            </div>
            <FolderTree className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Categories
              </p>
              <p className="text-2xl font-bold">
                {stats?.activeCategories || 0}
              </p>
            </div>
            <Grid className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Featured Categories
              </p>
              <p className="text-2xl font-bold">
                {stats?.featuredCategories || 0}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-yellow-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Root Categories
              </p>
              <p className="text-2xl font-bold">
                {stats?.categoriesByLevel?.find((level) => level.level === 0)
                  ?.count || 0}
              </p>
            </div>
            <List className="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const CategoriesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<
    Category | undefined
  >();
  const [parentId, setParentId] = useState<string | undefined>();

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleCategoryEdit = (category: Category) => {
    setEditingCategory(category);
    setParentId(undefined);
    setIsFormModalOpen(true);
  };

  const handleCategoryAdd = (parentId?: string) => {
    setEditingCategory(undefined);
    setParentId(parentId);
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setEditingCategory(undefined);
    setParentId(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-gray-600 mt-1">
            Organize your products with hierarchical categories
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>

          <Button onClick={() => handleCategoryAdd()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <CategoryStatistics />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Tree */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderTree className="h-5 w-5" />
                Category Hierarchy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryTree
                onCategorySelect={handleCategorySelect}
                onCategoryEdit={handleCategoryEdit}
                onCategoryAdd={handleCategoryAdd}
                selectedCategoryId={selectedCategory?._id}
                showActions={true}
                showProductCount={true}
                maxDepth={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Category Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Category Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCategory ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {selectedCategory.image?.url ? (
                      <img
                        src={selectedCategory.image.url}
                        alt={selectedCategory.name}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                        <span className="text-2xl">
                          {selectedCategory.icon || "📦"}
                        </span>
                      </div>
                    )}

                    <div>
                      <h3 className="font-semibold text-lg">
                        {selectedCategory.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Level {selectedCategory.level}
                      </p>
                    </div>
                  </div>

                  {selectedCategory.description && (
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-sm text-gray-600">
                        {selectedCategory.description}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Products:</span>
                      <span className="ml-2">
                        {selectedCategory.productCount || 0}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Views:</span>
                      <span className="ml-2">
                        {selectedCategory.viewCount || 0}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <span
                        className={`ml-2 ${
                          selectedCategory.isActive
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {selectedCategory.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Featured:</span>
                      <span
                        className={`ml-2 ${
                          selectedCategory.isFeatured
                            ? "text-yellow-600"
                            : "text-gray-600"
                        }`}
                      >
                        {selectedCategory.isFeatured ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>

                  {selectedCategory.path && (
                    <div>
                      <h4 className="font-medium mb-2">Path</h4>
                      <p className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded">
                        {selectedCategory.path}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button
                      size="sm"
                      onClick={() => handleCategoryEdit(selectedCategory)}
                    >
                      Edit Category
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCategoryAdd(selectedCategory._id)}
                    >
                      Add Subcategory
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FolderTree className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a category to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Category Form Modal */}
      <CategoryFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseModal}
        category={editingCategory}
        parentId={parentId}
      />
    </div>
  );
};

export default CategoriesPage;
