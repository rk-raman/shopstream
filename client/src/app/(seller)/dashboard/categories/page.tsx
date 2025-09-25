"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { FolderTree, Tag, TrendingUp, Star, Plus } from "lucide-react";
import { Category } from "@/types/global";
import {
  CategoryTree,
  CategoryForm,
} from "@/features/seller/components/Categories";
import { getCategoryStatistics } from "@/features/seller/services/categoryService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CategoryStats {
  totalCategories: number;
  activeCategories: number;
  featuredCategories: number;
  categoriesByLevel: { level: number; count: number }[];
}

function CategoriesPageInner() {
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  const [stats, setStats] = useState<CategoryStats | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const data = await getCategoryStatistics();
      setStats(data);
    } catch (e) {
      // Silently ignore for now; UI remains without stats
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleAdd = (parent?: string) => {
    setEditingCategory(null);
    setParentId(parent);
    setOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setParentId(
      // support both populated and id string parent
      (category as any).parent?._id ||
        (typeof (category as any).parent === "string"
          ? (category as any).parent
          : undefined)
    );
    setOpen(true);
  };

  const handleSuccess = () => {
    setOpen(false);
    setEditingCategory(null);
    setParentId(undefined);
    fetchStats();
  };

  const handleCancel = () => {
    setOpen(false);
    setEditingCategory(null);
    setParentId(undefined);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage your product categories and hierarchy
          </p>
        </div>
        <Button onClick={() => handleAdd()}>
          <Plus className="h-4 w-4 mr-2" /> Add Category
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">
              Total Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-3xl font-bold">
              {loadingStats ? "—" : stats?.totalCategories ?? 0}
            </div>
            <FolderTree className="h-8 w-8 text-primary" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-3xl font-bold">
              {loadingStats ? "—" : stats?.activeCategories ?? 0}
            </div>
            <Tag className="h-8 w-8 text-emerald-600" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Featured</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-3xl font-bold">
              {loadingStats ? "—" : stats?.featuredCategories ?? 0}
            </div>
            <Star className="h-8 w-8 text-amber-500" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Levels</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {loadingStats
                ? "—"
                : (stats?.categoriesByLevel || [])
                    .map((l) => `L${l.level}: ${l.count}`)
                    .join(" · ") || "No data"}
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </CardContent>
        </Card>
      </div>

      {/* Category Tree */}
      <Card>
        <CardHeader>
          <CardTitle>Category Tree</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryTree
            onCategoryEdit={handleEdit}
            onCategoryAdd={handleAdd}
            showActions
            showProductCount
          />
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <AlertDialog
        open={open}
        onOpenChange={(v) => (v ? setOpen(true) : handleCancel())}
      >
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {editingCategory ? "Edit Category" : "Add Category"}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <CategoryForm
            category={editingCategory || undefined}
            parentId={parentId}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Disable SSR for this client-heavy page to avoid hydration mismatches
export default dynamic(() => Promise.resolve(CategoriesPageInner), {
  ssr: false,
});
