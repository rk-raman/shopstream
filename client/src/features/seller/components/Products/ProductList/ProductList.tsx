"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit,
  Eye,
  MoreHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Product } from "@/types/global";
import { PRODUCT_CONFIG } from "@/constants/constants";
import {
  useProducts,
  useDeleteProduct,
  useBulkDeleteProducts,
} from "@/features/seller/hooks/useProducts";
import { useCategories } from "@/features/seller/hooks/useCategories";
import { useBrands } from "@/features/seller/hooks/useBrands";

interface ProductListProps {
  onCreateProduct?: () => void;
  onEditProduct?: (product: Product) => void;
  onViewProduct?: (product: Product) => void;
}

interface Filters {
  category: string;
  brand: string;
  status: string;
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
}

const ITEMS_PER_PAGE = 12;

export const ProductList: React.FC<ProductListProps> = ({
  onCreateProduct,
  onEditProduct,
  onViewProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filters, setFilters] = useState<Filters>({
    category: "",
    brand: "",
    status: "",
    minPrice: "",
    maxPrice: "",
    inStock: false,
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page on search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Build query parameters
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      sortBy,
      sortOrder,
    };

    if (debouncedSearchTerm) {
      params.search = debouncedSearchTerm;
    }

    if (filters.category) {
      params.category = filters.category;
    }

    if (filters.brand) {
      params.brand = filters.brand;
    }

    if (filters.status) {
      params.status = filters.status;
    }

    if (filters.minPrice) {
      params.minPrice = parseFloat(filters.minPrice);
    }

    if (filters.maxPrice) {
      params.maxPrice = parseFloat(filters.maxPrice);
    }

    if (filters.inStock) {
      params.inStock = true;
    }

    return params;
  }, [currentPage, debouncedSearchTerm, filters, sortBy, sortOrder]);

  // Fetch data
  const {
    data: productsData,
    isLoading,
    error,
    refetch,
  } = useProducts(queryParams);

  const { data: categoriesData } = useCategories();
  const { data: brandsData } = useBrands();

  // Mutations
  const deleteProductMutation = useDeleteProduct();
  const bulkDeleteMutation = useBulkDeleteProducts();

  const products = productsData?.data || [];
  const totalProducts = productsData?.total || 0;
  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
  const categories = categoriesData || [];
  const brands = brandsData || [];

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((product) => product.id));
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await deleteProductMutation.mutateAsync(productId);
      setSelectedProducts((prev) => prev.filter((id) => id !== productId));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedProducts.length} selected products?`
      )
    ) {
      await bulkDeleteMutation.mutateAsync(selectedProducts);
      setSelectedProducts([]);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      brand: "",
      status: "",
      minPrice: "",
      maxPrice: "",
      inStock: false,
    });
    setCurrentPage(1);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "draft":
        return "secondary";
      case "inactive":
        return "outline";
      case "discontinued":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-red-600 mb-4">Failed to load products</p>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-gray-600">
            Manage your product catalog ({totalProducts} products)
          </p>
        </div>
        <Button onClick={onCreateProduct} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date Created</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="basePrice">Price</SelectItem>
                <SelectItem value="stock">Stock</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortOrder}
              onValueChange={(value: "asc" | "desc") => setSortOrder(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Descending</SelectItem>
                <SelectItem value="asc">Ascending</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Category
                </label>
                <Select
                  value={filters.category}
                  onValueChange={(value) =>
                    handleFilterChange("category", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-categories">
                      All categories
                    </SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {"  ".repeat(category.level || 0)}
                          </span>
                          {category.icon && (
                            <span className="text-sm">{category.icon}</span>
                          )}
                          <span>{category.name}</span>
                          {!category.isActive && (
                            <span className="text-xs text-red-500">
                              (Inactive)
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Brand</label>
                <Select
                  value={filters.brand}
                  onValueChange={(value) => handleFilterChange("brand", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All brands" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-brands">All brands</SelectItem>
                    {brands.map((brand) => (
                      <SelectItem key={brand._id} value={brand._id}>
                        <div className="flex items-center gap-2">
                          {brand.logo?.url ? (
                            <img
                              src={brand.logo.url}
                              alt={brand.name}
                              className="w-4 h-4 rounded object-cover"
                            />
                          ) : (
                            <div className="w-4 h-4 bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-xs">B</span>
                            </div>
                          )}
                          <span>{brand.name}</span>
                          {brand.isVerified && (
                            <span className="text-xs text-blue-500">✓</span>
                          )}
                          {!brand.isActive && (
                            <span className="text-xs text-red-500">
                              (Inactive)
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-statuses">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Min Price
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={filters.minPrice}
                  onChange={(e) =>
                    handleFilterChange("minPrice", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Max Price
                </label>
                <Input
                  type="number"
                  placeholder="999.99"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    handleFilterChange("maxPrice", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inStock"
                  checked={filters.inStock}
                  onCheckedChange={(checked) =>
                    handleFilterChange("inStock", checked)
                  }
                />
                <label htmlFor="inStock" className="text-sm font-medium">
                  In stock only
                </label>
              </div>

              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {selectedProducts.length} product(s) selected
            </p>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={bulkDeleteMutation.isPending}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="p-4 animate-pulse">
              <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
              <div className="space-y-2">
                <div className="bg-gray-200 h-4 rounded"></div>
                <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                <div className="bg-gray-200 h-4 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-600 mb-4">
            {debouncedSearchTerm || Object.values(filters).some(Boolean)
              ? "No products found matching your criteria"
              : "No products yet"}
          </p>
          <Button onClick={onCreateProduct}>Create Your First Product</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                {/* Selection Checkbox */}
                <div className="absolute top-2 left-2 z-10">
                  <Checkbox
                    checked={selectedProducts.includes(product.id)}
                    onCheckedChange={() => handleSelectProduct(product.id)}
                    className="bg-white"
                  />
                </div>

                {/* Product Image */}
                <div className="h-48 bg-gray-100 relative overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}

                  {/* Actions Overlay */}
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onViewProduct?.(product)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onEditProduct?.(product)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm line-clamp-2 flex-1">
                      {product.name}
                    </h3>
                    <Badge
                      variant={getStatusBadgeVariant(product.status)}
                      className="ml-2 text-xs"
                    >
                      {product.status}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">
                        {formatPrice(product.basePrice)}
                      </span>
                      {product.discountPrice &&
                        product.discountPrice < product.basePrice && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(product.discountPrice)}
                          </span>
                        )}
                    </div>

                    {/* Stock */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Stock:</span>
                      <span
                        className={
                          product.stock > 0 ? "text-green-600" : "text-red-600"
                        }
                      >
                        {product.stock} units
                      </span>
                    </div>

                    {/* SKU */}
                    {product.sku && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">SKU:</span>
                        <span className="font-mono text-xs">{product.sku}</span>
                      </div>
                    )}

                    {/* Rating */}
                    {product.rating && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Rating:</span>
                        <span className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span>{product.rating.average.toFixed(1)}</span>
                          <span className="text-gray-500">
                            ({product.rating.count})
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Select All Checkbox */}
      {products.length > 0 && (
        <div className="fixed bottom-4 right-4">
          <Card className="p-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedProducts.length === products.length}
                onCheckedChange={handleSelectAll}
              />
              <label className="text-sm font-medium">Select All</label>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
