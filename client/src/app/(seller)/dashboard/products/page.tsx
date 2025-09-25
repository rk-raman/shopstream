"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import {
  getMyProducts,
  deleteProduct,
  bulkDeleteProducts,
  updateProductStatus,
} from "@/services/productService";
import { Product } from "@/types/global";

interface ProductsPageState {
  products: Product[];
  loading: boolean;
  error: string | null;
  selectedProducts: string[];
  filters: {
    search: string;
    status: string;
    category: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function ProductsPage() {
  const router = useRouter();
  const [state, setState] = useState<ProductsPageState>({
    products: [],
    loading: true,
    error: null,
    selectedProducts: [],
    filters: {
      search: "",
      status: "",
      category: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    },
    pagination: {
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 0,
    },
  });

  // Load products
  const loadProducts = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await getMyProducts({
        ...state.filters,
        page: state.pagination.page,
        limit: state.pagination.limit,
      });

      if (response.success) {
        setState((prev) => ({
          ...prev,
          products: response.data.products,
          pagination: {
            ...prev.pagination,
            total: response.data.pagination.total,
            totalPages: response.data.pagination.totalPages,
          },
          loading: false,
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Failed to load products",
        loading: false,
      }));
    }
  };

  useEffect(() => {
    loadProducts();
  }, [state.filters, state.pagination.page]);

  // Handle search
  const handleSearch = (value: string) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, search: value },
      pagination: { ...prev.pagination, page: 1 },
    }));
  };

  // Handle filter change
  const handleFilterChange = (key: string, value: string) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, [key]: value },
      pagination: { ...prev.pagination, page: 1 },
    }));
  };

  // Handle product selection
  const handleProductSelect = (productId: string) => {
    setState((prev) => ({
      ...prev,
      selectedProducts: prev.selectedProducts.includes(productId)
        ? prev.selectedProducts.filter((id) => id !== productId)
        : [...prev.selectedProducts, productId],
    }));
  };

  // Handle select all
  const handleSelectAll = () => {
    setState((prev) => ({
      ...prev,
      selectedProducts:
        prev.selectedProducts.length === prev.products.length
          ? []
          : prev.products.map((p) => p._id),
    }));
  };

  // Handle delete product
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteProduct(productId);
      loadProducts();
    } catch (error) {
      alert("Failed to delete product");
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete ${state.selectedProducts.length} products?`
      )
    )
      return;

    try {
      await bulkDeleteProducts(state.selectedProducts);
      setState((prev) => ({ ...prev, selectedProducts: [] }));
      loadProducts();
    } catch (error) {
      alert("Failed to delete products");
    }
  };

  // Handle status change
  const handleStatusChange = async (productId: string, status: string) => {
    try {
      await updateProductStatus(productId, status);
      loadProducts();
    } catch (error) {
      alert("Failed to update product status");
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "inactive":
        return "bg-yellow-100 text-yellow-800";
      case "discontinued":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your product catalog</p>
        </div>
        <button
          onClick={() => router.push("/seller/dashboard/products/add")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={state.filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={state.filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="inactive">Inactive</option>
            <option value="discontinued">Discontinued</option>
          </select>

          {/* Sort */}
          <select
            value={`${state.filters.sortBy}-${state.filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split("-");
              setState((prev) => ({
                ...prev,
                filters: {
                  ...prev.filters,
                  sortBy,
                  sortOrder: sortOrder as "asc" | "desc",
                },
              }));
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="basePrice-asc">Price Low-High</option>
            <option value="basePrice-desc">Price High-Low</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {state.selectedProducts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-blue-800">
              {state.selectedProducts.length} product(s) selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkDelete}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {state.loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : state.error ? (
        <div className="text-center py-12">
          <p className="text-red-600">{state.error}</p>
          <button
            onClick={loadProducts}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      ) : state.products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No products found</p>
          <button
            onClick={() => router.push("/seller/dashboard/products/add")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Your First Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {state.products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow-sm border overflow-hidden"
            >
              {/* Product Image */}
              <div className="relative">
                <img
                  src={product.images[0] || "/placeholder-product.jpg"}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 left-2">
                  <input
                    type="checkbox"
                    checked={state.selectedProducts.includes(product._id)}
                    onChange={() => handleProductSelect(product._id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
                      product.status
                    )}`}
                  >
                    {product.status}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 truncate">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                  {product.shortDescription}
                </p>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">
                      ${product.discountPrice || product.basePrice}
                    </span>
                    {product.discountPrice && (
                      <span className="text-gray-500 line-through text-sm">
                        ${product.basePrice}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-600">
                    Stock: {product.stock}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        router.push(
                          `/seller/dashboard/products/edit/${product._id}`
                        )
                      }
                      className="p-1 text-gray-600 hover:text-blue-600"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => router.push(`/products/${product.slug}`)}
                      className="p-1 text-gray-600 hover:text-green-600"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="p-1 text-gray-600 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <select
                    value={product.status}
                    onChange={(e) =>
                      handleStatusChange(product._id, e.target.value)
                    }
                    className="text-xs border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="discontinued">Discontinued</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {state.pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() =>
              setState((prev) => ({
                ...prev,
                pagination: {
                  ...prev.pagination,
                  page: Math.max(1, prev.pagination.page - 1),
                },
              }))
            }
            disabled={state.pagination.page === 1}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>

          <span className="px-4 py-2 text-sm text-gray-600">
            Page {state.pagination.page} of {state.pagination.totalPages}
          </span>

          <button
            onClick={() =>
              setState((prev) => ({
                ...prev,
                pagination: {
                  ...prev.pagination,
                  page: Math.min(
                    prev.pagination.totalPages,
                    prev.pagination.page + 1
                  ),
                },
              }))
            }
            disabled={state.pagination.page === state.pagination.totalPages}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
