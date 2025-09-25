"use client";

import React, { useState, useEffect } from "react";
import {
  FolderTree,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  ChevronRight,
  ChevronDown,
  Image as ImageIcon,
  Tag,
  TrendingUp,
} from "lucide-react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
} from "@/services/categoryService";
import { Category, CategoryFormData } from "@/types/global";

interface CategoryState {
  categories: Category[];
  filteredCategories: Category[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  selectedCategory: Category | null;
  showForm: boolean;
  editingCategory: Category | null;
  expandedCategories: Set<string>;
  submitting: boolean;
}

interface CategoryFormState {
  formData: CategoryFormData;
  imageFile: File | null;
  imagePreview: string | null;
}

export default function CategoriesPage() {
  const [state, setState] = useState<CategoryState>({
    categories: [],
    filteredCategories: [],
    loading: true,
    error: null,
    searchTerm: "",
    selectedCategory: null,
    showForm: false,
    editingCategory: null,
    expandedCategories: new Set(),
    submitting: false,
  });

  const [formState, setFormState] = useState<CategoryFormState>({
    formData: {
      name: "",
      description: "",
      parent: "",
      image: "",
      seo: {
        metaTitle: "",
        metaDescription: "",
        metaKeywords: [],
      },
      attributes: [],
      commission: {
        type: "percentage",
        value: 0,
      },
      status: "active",
    },
    imageFile: null,
    imagePreview: null,
  });

  // Load categories
  useEffect(() => {
    loadCategories();
  }, []);

  // Filter categories based on search
  useEffect(() => {
    if (!state.searchTerm) {
      setState((prev) => ({ ...prev, filteredCategories: prev.categories }));
    } else {
      const filtered = state.categories.filter(
        (category) =>
          category.name
            .toLowerCase()
            .includes(state.searchTerm.toLowerCase()) ||
          category.description
            ?.toLowerCase()
            .includes(state.searchTerm.toLowerCase())
      );
      setState((prev) => ({ ...prev, filteredCategories: filtered }));
    }
  }, [state.searchTerm, state.categories]);

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      if (response.success) {
        setState((prev) => ({
          ...prev,
          categories: response.data,
          loading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: response.error || "Failed to load categories",
          loading: false,
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Failed to load categories",
        loading: false,
      }));
    }
  };

  // Build hierarchical tree structure
  const buildCategoryTree = (
    categories: Category[],
    parentId: string | null = null
  ): Category[] => {
    return categories
      .filter((category) => category.parent === parentId)
      .map((category) => ({
        ...category,
        children: buildCategoryTree(categories, category._id),
      }));
  };

  // Toggle category expansion
  const toggleExpanded = (categoryId: string) => {
    setState((prev) => {
      const newExpanded = new Set(prev.expandedCategories);
      if (newExpanded.has(categoryId)) {
        newExpanded.delete(categoryId);
      } else {
        newExpanded.add(categoryId);
      }
      return { ...prev, expandedCategories: newExpanded };
    });
  };

  // Handle form field changes
  const handleFormFieldChange = (field: string, value: any) => {
    setFormState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value,
      },
    }));
  };

  // Handle nested form field changes
  const handleNestedFormFieldChange = (
    parent: string,
    field: string,
    value: any
  ) => {
    setFormState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        [parent]: {
          ...prev.formData[parent as keyof CategoryFormData],
          [field]: value,
        },
      },
    }));
  };

  // Handle image upload
  const handleImageUpload = (file: File) => {
    setFormState((prev) => ({
      ...prev,
      imageFile: file,
      imagePreview: URL.createObjectURL(file),
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormState({
      formData: {
        name: "",
        description: "",
        parent: "",
        image: "",
        seo: {
          metaTitle: "",
          metaDescription: "",
          metaKeywords: [],
        },
        attributes: [],
        commission: {
          type: "percentage",
          value: 0,
        },
        status: "active",
      },
      imageFile: null,
      imagePreview: null,
    });
    setState((prev) => ({
      ...prev,
      showForm: false,
      editingCategory: null,
    }));
  };

  // Handle create/edit category
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState((prev) => ({ ...prev, submitting: true, error: null }));

    try {
      // Upload image if provided
      let imageUrl = formState.formData.image;
      if (formState.imageFile) {
        const uploadRes = await uploadCategoryImage(formState.imageFile);
        if (uploadRes.success) {
          imageUrl = uploadRes.data;
        }
      }

      const categoryData = {
        ...formState.formData,
        image: imageUrl,
      };

      let response;
      if (state.editingCategory) {
        response = await updateCategory(
          state.editingCategory._id,
          categoryData
        );
      } else {
        response = await createCategory(categoryData);
      }

      if (response.success) {
        await loadCategories();
        resetForm();
      } else {
        setState((prev) => ({
          ...prev,
          error: response.error || "Failed to save category",
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Failed to save category",
      }));
    } finally {
      setState((prev) => ({ ...prev, submitting: false }));
    }
  };

  // Handle edit category
  const handleEdit = (category: Category) => {
    setFormState({
      formData: {
        name: category.name,
        description: category.description || "",
        parent: category.parent || "",
        image: category.image || "",
        seo: category.seo || {
          metaTitle: "",
          metaDescription: "",
          metaKeywords: [],
        },
        attributes: category.attributes || [],
        commission: category.commission || {
          type: "percentage",
          value: 0,
        },
        status: category.status,
      },
      imageFile: null,
      imagePreview: category.image || null,
    });
    setState((prev) => ({
      ...prev,
      editingCategory: category,
      showForm: true,
    }));
  };

  // Handle delete category
  const handleDelete = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const response = await deleteCategory(categoryId);
      if (response.success) {
        await loadCategories();
      } else {
        setState((prev) => ({
          ...prev,
          error: response.error || "Failed to delete category",
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Failed to delete category",
      }));
    }
  };

  // Render category tree item
  const renderCategoryItem = (category: Category, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = state.expandedCategories.has(category._id);

    return (
      <div
        key={category._id}
        className="border-b border-gray-100 last:border-b-0"
      >
        <div
          className="flex items-center justify-between p-4 hover:bg-gray-50"
          style={{ paddingLeft: `${16 + level * 24}px` }}
        >
          <div className="flex items-center gap-3 flex-1">
            {hasChildren ? (
              <button
                onClick={() => toggleExpanded(category._id)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            ) : (
              <div className="w-6" />
            )}

            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                className="w-8 h-8 rounded object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                <FolderTree className="w-4 h-4 text-gray-500" />
              </div>
            )}

            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{category.name}</h3>
              {category.description && (
                <p className="text-sm text-gray-600 truncate">
                  {category.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Tag className="w-4 h-4" />
                {category.productCount || 0}
              </span>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  category.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {category.status}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleEdit(category)}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(category._id)}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {category.children!.map((child) =>
              renderCategoryItem(child, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  if (state.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const categoryTree = buildCategoryTree(state.filteredCategories);
  const rootCategories = state.categories.filter((cat) => !cat.parent);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600">Manage your product categories</p>
        </div>
        <button
          onClick={() => setState((prev) => ({ ...prev, showForm: true }))}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Categories</p>
              <p className="text-2xl font-bold text-gray-900">
                {state.categories.length}
              </p>
            </div>
            <FolderTree className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Root Categories</p>
              <p className="text-2xl font-bold text-gray-900">
                {rootCategories.length}
              </p>
            </div>
            <FolderTree className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Categories</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  state.categories.filter((cat) => cat.status === "active")
                    .length
                }
              </p>
            </div>
            <Tag className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">
                {state.categories.reduce(
                  (sum, cat) => sum + (cat.productCount || 0),
                  0
                )}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search categories..."
            value={state.searchTerm}
            onChange={(e) =>
              setState((prev) => ({ ...prev, searchTerm: e.target.value }))
            }
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Error Message */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{state.error}</p>
        </div>
      )}

      {/* Categories Tree */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Category Tree</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {categoryTree.length > 0 ? (
            categoryTree.map((category) => renderCategoryItem(category))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <FolderTree className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No categories found</p>
            </div>
          )}
        </div>
      </div>

      {/* Category Form Modal */}
      {state.showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">
                {state.editingCategory ? "Edit Category" : "Add New Category"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.formData.name}
                    onChange={(e) =>
                      handleFormFieldChange("name", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter category name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formState.formData.description}
                    onChange={(e) =>
                      handleFormFieldChange("description", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Category description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Category
                  </label>
                  <select
                    value={formState.formData.parent}
                    onChange={(e) =>
                      handleFormFieldChange("parent", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No Parent (Root Category)</option>
                    {rootCategories
                      .filter((cat) => cat._id !== state.editingCategory?._id)
                      .map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formState.formData.status}
                    onChange={(e) =>
                      handleFormFieldChange("status", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files?.[0] &&
                      handleImageUpload(e.target.files[0])
                    }
                    className="hidden"
                    id="category-image"
                  />
                  <label
                    htmlFor="category-image"
                    className="cursor-pointer block text-center"
                  >
                    {formState.imagePreview ? (
                      <img
                        src={formState.imagePreview}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded mx-auto mb-2"
                      />
                    ) : (
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    )}
                    <p className="text-gray-600">Click to upload image</p>
                  </label>
                </div>
              </div>

              {/* Commission Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Commission Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Commission Type
                    </label>
                    <select
                      value={formState.formData.commission?.type}
                      onChange={(e) =>
                        handleNestedFormFieldChange(
                          "commission",
                          "type",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Commission Value
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formState.formData.commission?.value}
                      onChange={(e) =>
                        handleNestedFormFieldChange(
                          "commission",
                          "value",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* SEO Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">SEO Settings</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={formState.formData.seo?.metaTitle}
                    onChange={(e) =>
                      handleNestedFormFieldChange(
                        "seo",
                        "metaTitle",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="SEO title"
                    maxLength={60}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    rows={3}
                    value={formState.formData.seo?.metaDescription}
                    onChange={(e) =>
                      handleNestedFormFieldChange(
                        "seo",
                        "metaDescription",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="SEO description"
                    maxLength={160}
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={state.submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {state.submitting
                    ? "Saving..."
                    : state.editingCategory
                    ? "Update"
                    : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
