"use client";

import React, { useState, useEffect } from "react";
import {
  FolderOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Image as ImageIcon,
  Package,
  Users,
  TrendingUp,
} from "lucide-react";
import {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  uploadCollectionImage,
} from "@/services/collectionService";
import { getProducts } from "@/services/productService";
import { Collection, CollectionFormData, Product } from "@/types/global";

interface CollectionState {
  collections: Collection[];
  filteredCollections: Collection[];
  products: Product[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  showForm: boolean;
  editingCollection: Collection | null;
  submitting: boolean;
}

interface CollectionFormState {
  formData: CollectionFormData;
  imageFile: File | null;
  imagePreview: string | null;
  selectedProducts: string[];
}

export default function CollectionsPage() {
  const [state, setState] = useState<CollectionState>({
    collections: [],
    filteredCollections: [],
    products: [],
    loading: true,
    error: null,
    searchTerm: "",
    showForm: false,
    editingCollection: null,
    submitting: false,
  });

  const [formState, setFormState] = useState<CollectionFormState>({
    formData: {
      title: "",
      description: "",
      handle: "",
      image: "",
      type: "manual",
      products: [],
      seo: {
        metaTitle: "",
        metaDescription: "",
        metaKeywords: [],
      },
      isVisible: true,
      sortOrder: 0,
    },
    imageFile: null,
    imagePreview: null,
    selectedProducts: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!state.searchTerm) {
      setState((prev) => ({ ...prev, filteredCollections: prev.collections }));
    } else {
      const filtered = state.collections.filter(
        (collection) =>
          collection.title
            .toLowerCase()
            .includes(state.searchTerm.toLowerCase()) ||
          collection.description
            ?.toLowerCase()
            .includes(state.searchTerm.toLowerCase())
      );
      setState((prev) => ({ ...prev, filteredCollections: filtered }));
    }
  }, [state.searchTerm, state.collections]);

  const loadData = async () => {
    try {
      const [collectionsRes, productsRes] = await Promise.all([
        getCollections(),
        getProducts(),
      ]);

      setState((prev) => ({
        ...prev,
        collections: collectionsRes.success ? collectionsRes.data : [],
        products: productsRes.success ? productsRes.data : [],
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Failed to load data",
        loading: false,
      }));
    }
  };

  const handleFormFieldChange = (field: string, value: any) => {
    setFormState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value,
      },
    }));
  };

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
          ...prev.formData[parent as keyof CollectionFormData],
          [field]: value,
        },
      },
    }));
  };

  const handleImageUpload = (file: File) => {
    setFormState((prev) => ({
      ...prev,
      imageFile: file,
      imagePreview: URL.createObjectURL(file),
    }));
  };

  const handleProductToggle = (productId: string) => {
    setFormState((prev) => {
      const isSelected = prev.selectedProducts.includes(productId);
      const newSelected = isSelected
        ? prev.selectedProducts.filter((id) => id !== productId)
        : [...prev.selectedProducts, productId];

      return {
        ...prev,
        selectedProducts: newSelected,
        formData: {
          ...prev.formData,
          products: newSelected,
        },
      };
    });
  };

  const resetForm = () => {
    setFormState({
      formData: {
        title: "",
        description: "",
        handle: "",
        image: "",
        type: "manual",
        products: [],
        seo: {
          metaTitle: "",
          metaDescription: "",
          metaKeywords: [],
        },
        isVisible: true,
        sortOrder: 0,
      },
      imageFile: null,
      imagePreview: null,
      selectedProducts: [],
    });
    setState((prev) => ({
      ...prev,
      showForm: false,
      editingCollection: null,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState((prev) => ({ ...prev, submitting: true, error: null }));

    try {
      let imageUrl = formState.formData.image;
      if (formState.imageFile) {
        const uploadRes = await uploadCollectionImage(formState.imageFile);
        if (uploadRes.success) {
          imageUrl = uploadRes.data;
        }
      }

      const collectionData = {
        ...formState.formData,
        image: imageUrl,
        handle:
          formState.formData.handle ||
          formState.formData.title.toLowerCase().replace(/\s+/g, "-"),
      };

      let response;
      if (state.editingCollection) {
        response = await updateCollection(
          state.editingCollection._id,
          collectionData
        );
      } else {
        response = await createCollection(collectionData);
      }

      if (response.success) {
        await loadData();
        resetForm();
      } else {
        setState((prev) => ({
          ...prev,
          error: response.error || "Failed to save collection",
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Failed to save collection",
      }));
    } finally {
      setState((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handleEdit = (collection: Collection) => {
    setFormState({
      formData: {
        title: collection.title,
        description: collection.description || "",
        handle: collection.handle || "",
        image: collection.image || "",
        type: collection.type,
        products: collection.products || [],
        seo: collection.seo || {
          metaTitle: "",
          metaDescription: "",
          metaKeywords: [],
        },
        isVisible: collection.isVisible !== false,
        sortOrder: collection.sortOrder || 0,
      },
      imageFile: null,
      imagePreview: collection.image || null,
      selectedProducts: collection.products || [],
    });
    setState((prev) => ({
      ...prev,
      editingCollection: collection,
      showForm: true,
    }));
  };

  const handleDelete = async (collectionId: string) => {
    if (!confirm("Are you sure you want to delete this collection?")) return;

    try {
      const response = await deleteCollection(collectionId);
      if (response.success) {
        await loadData();
      } else {
        setState((prev) => ({
          ...prev,
          error: response.error || "Failed to delete collection",
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Failed to delete collection",
      }));
    }
  };

  if (state.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const visibleCollections = state.collections.filter(
    (collection) => collection.isVisible
  );
  const totalProducts = state.collections.reduce(
    (sum, collection) => sum + (collection.productCount || 0),
    0
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Collections</h1>
          <p className="text-gray-600">
            Organize your products into collections
          </p>
        </div>
        <button
          onClick={() => setState((prev) => ({ ...prev, showForm: true }))}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Collection
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Collections</p>
              <p className="text-2xl font-bold text-gray-900">
                {state.collections.length}
              </p>
            </div>
            <FolderOpen className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Visible Collections</p>
              <p className="text-2xl font-bold text-gray-900">
                {visibleCollections.length}
              </p>
            </div>
            <Eye className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Products in Collections</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalProducts}
              </p>
            </div>
            <Package className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available Products</p>
              <p className="text-2xl font-bold text-gray-900">
                {state.products.length}
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
            placeholder="Search collections..."
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

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.filteredCollections.map((collection) => (
          <div
            key={collection._id}
            className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
              {collection.image ? (
                <img
                  src={collection.image}
                  alt={collection.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FolderOpen className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {collection.title}
                  </h3>
                  {collection.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {collection.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(collection)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(collection._id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1 text-gray-600">
                  <Package className="w-4 h-4" />
                  {collection.productCount || 0} products
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      collection.type === "manual"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {collection.type}
                  </span>
                  {!collection.isVisible && (
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                      Hidden
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {state.filteredCollections.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No collections found</p>
        </div>
      )}

      {/* Collection Form Modal */}
      {state.showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">
                {state.editingCollection
                  ? "Edit Collection"
                  : "Create New Collection"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Collection Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formState.formData.title}
                      onChange={(e) =>
                        handleFormFieldChange("title", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter collection title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Handle
                    </label>
                    <input
                      type="text"
                      value={formState.formData.handle}
                      onChange={(e) =>
                        handleFormFieldChange("handle", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="collection-handle"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      value={formState.formData.description}
                      onChange={(e) =>
                        handleFormFieldChange("description", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Collection description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type
                      </label>
                      <select
                        value={formState.formData.type}
                        onChange={(e) =>
                          handleFormFieldChange("type", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="manual">Manual</option>
                        <option value="automated">Automated</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sort Order
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formState.formData.sortOrder}
                        onChange={(e) =>
                          handleFormFieldChange(
                            "sortOrder",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isVisible"
                      checked={formState.formData.isVisible}
                      onChange={(e) =>
                        handleFormFieldChange("isVisible", e.target.checked)
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="isVisible"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Visible to customers
                    </label>
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Collection Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        handleImageUpload(e.target.files[0])
                      }
                      className="hidden"
                      id="collection-image"
                    />
                    <label
                      htmlFor="collection-image"
                      className="cursor-pointer block text-center"
                    >
                      {formState.imagePreview ? (
                        <img
                          src={formState.imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded mx-auto mb-2"
                        />
                      ) : (
                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      )}
                      <p className="text-gray-600">Click to upload image</p>
                    </label>
                  </div>
                </div>
              </div>

              {/* Product Selection */}
              {formState.formData.type === "manual" && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Select Products</h3>
                  <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg">
                    {state.products.map((product) => (
                      <div
                        key={product._id}
                        className="flex items-center p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={formState.selectedProducts.includes(
                            product._id
                          )}
                          onChange={() => handleProductToggle(product._id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div className="ml-3 flex items-center gap-3 flex-1">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {product.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              ${product.basePrice}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                    : state.editingCollection
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
