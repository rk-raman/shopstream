import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Grid,
  List,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Verified,
  Upload,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Brand } from "@/types/global";
import {
  useBrands,
  useUpdateBrandStatus,
  useToggleBrandFeatured,
  useToggleBrandVerified,
  useBulkDeleteBrands,
} from "../../hooks/useBrands";
import { useDebounce } from "@/hooks/useDebounce";

interface BrandListProps {
  onBrandSelect?: (brand: Brand) => void;
  onBrandEdit?: (brand: Brand) => void;
  onBrandCreate?: () => void;
  selectedBrandIds?: string[];
  onSelectionChange?: (brandIds: string[]) => void;
}

type ViewMode = "grid" | "list";
type SortBy = "name" | "productCount" | "viewCount" | "createdAt";
type SortOrder = "asc" | "desc";

export const BrandList: React.FC<BrandListProps> = ({
  onBrandSelect,
  onBrandEdit,
  onBrandCreate,
  selectedBrandIds = [],
  onSelectionChange,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [featuredFilter, setFeaturedFilter] = useState<
    "all" | "featured" | "regular"
  >("all");
  const [verifiedFilter, setVerifiedFilter] = useState<
    "all" | "verified" | "unverified"
  >("all");
  const [page, setPage] = useState(1);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const queryParams = useMemo(
    () => ({
      page,
      limit: 20,
      search: debouncedSearchTerm || undefined,
      isActive: statusFilter === "all" ? undefined : statusFilter === "active",
      isFeatured:
        featuredFilter === "all" ? undefined : featuredFilter === "featured",
      isVerified:
        verifiedFilter === "all" ? undefined : verifiedFilter === "verified",
      sortBy,
      sortOrder,
    }),
    [
      page,
      debouncedSearchTerm,
      statusFilter,
      featuredFilter,
      verifiedFilter,
      sortBy,
      sortOrder,
    ]
  );

  const { data: brandsData, isLoading, error } = useBrands(queryParams);
  const updateBrandStatus = useUpdateBrandStatus();
  const toggleBrandFeatured = useToggleBrandFeatured();
  const toggleBrandVerified = useToggleBrandVerified();
  const bulkDeleteBrands = useBulkDeleteBrands();

  const brands = brandsData?.docs || [];
  const totalPages = brandsData?.totalPages || 1;
  const totalBrands = brandsData?.totalDocs || 0;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange?.(brands.map((brand) => brand._id));
    } else {
      onSelectionChange?.([]);
    }
  };

  const handleSelectBrand = (brandId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange?.([...selectedBrandIds, brandId]);
    } else {
      onSelectionChange?.(selectedBrandIds.filter((id) => id !== brandId));
    }
  };

  const handleBulkDelete = () => {
    if (selectedBrandIds.length === 0) return;

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedBrandIds.length} brand(s)? This action cannot be undone.`
      )
    ) {
      bulkDeleteBrands.mutate(selectedBrandIds);
      onSelectionChange?.([]);
    }
  };

  const BrandCard: React.FC<{ brand: Brand }> = ({ brand }) => {
    const isSelected = selectedBrandIds.includes(brand._id);

    return (
      <Card
        className={`cursor-pointer transition-all hover:shadow-md ${
          isSelected ? "ring-2 ring-blue-500" : ""
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) =>
                  handleSelectBrand(brand._id, checked as boolean)
                }
                onClick={(e) => e.stopPropagation()}
              />

              <div className="flex-shrink-0">
                {brand.logo?.url ? (
                  <img
                    src={brand.logo.url}
                    alt={brand.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                    <span className="text-lg font-semibold text-gray-600">
                      {brand.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm truncate">
                    {brand.name}
                  </h3>
                  {brand.isVerified && (
                    <Verified className="h-4 w-4 text-blue-500" />
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {brand.shortDescription || "No description"}
                </p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onBrandEdit?.(brand)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() =>
                    updateBrandStatus.mutate({
                      id: brand._id,
                      isActive: !brand.isActive,
                    })
                  }
                >
                  {brand.isActive ? (
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

                <DropdownMenuItem
                  onClick={() =>
                    toggleBrandFeatured.mutate({
                      id: brand._id,
                      isFeatured: !brand.isFeatured,
                    })
                  }
                >
                  <Star className="h-4 w-4 mr-2" />
                  {brand.isFeatured
                    ? "Remove from Featured"
                    : "Mark as Featured"}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() =>
                    toggleBrandVerified.mutate({
                      id: brand._id,
                      isVerified: !brand.isVerified,
                    })
                  }
                >
                  <Verified className="h-4 w-4 mr-2" />
                  {brand.isVerified
                    ? "Remove Verification"
                    : "Mark as Verified"}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => handleSelectBrand(brand._id, true)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <span>{brand.productCount || 0} products</span>
            <span>{brand.followerCount || 0} followers</span>
          </div>

          <div className="flex flex-wrap gap-1">
            {brand.isFeatured && (
              <Badge variant="secondary" className="text-xs">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}

            {brand.isVerified && (
              <Badge variant="default" className="text-xs">
                <Verified className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}

            {!brand.isActive && (
              <Badge variant="destructive" className="text-xs">
                Inactive
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const BrandRow: React.FC<{ brand: Brand }> = ({ brand }) => {
    const isSelected = selectedBrandIds.includes(brand._id);

    return (
      <div
        className={`flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 ${
          isSelected ? "bg-blue-50 border-blue-200" : ""
        }`}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) =>
            handleSelectBrand(brand._id, checked as boolean)
          }
        />

        <div className="flex-shrink-0">
          {brand.logo?.url ? (
            <img
              src={brand.logo.url}
              alt={brand.name}
              className="h-10 w-10 rounded-lg object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
              <span className="font-semibold text-gray-600">
                {brand.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">{brand.name}</h3>
            {brand.isVerified && <Verified className="h-4 w-4 text-blue-500" />}
          </div>
          <p className="text-sm text-gray-500 truncate">
            {brand.shortDescription || "No description"}
          </p>
        </div>

        <div className="flex items-center gap-6 text-sm text-gray-500">
          <span>{brand.productCount || 0} products</span>
          <span>{brand.followerCount || 0} followers</span>
        </div>

        <div className="flex items-center gap-2">
          {brand.isFeatured && (
            <Badge variant="secondary" className="text-xs">
              Featured
            </Badge>
          )}

          {!brand.isActive && (
            <Badge variant="destructive" className="text-xs">
              Inactive
            </Badge>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onBrandEdit?.(brand)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() =>
                updateBrandStatus.mutate({
                  id: brand._id,
                  isActive: !brand.isActive,
                })
              }
            >
              {brand.isActive ? (
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

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => handleSelectBrand(brand._id, true)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Failed to load brands. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Brands</h2>
          <p className="text-gray-600">Manage your brand collection</p>
        </div>

        <Button onClick={onBrandCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Brand
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(value: any) => setStatusFilter(value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={featuredFilter}
            onValueChange={(value: any) => setFeaturedFilter(value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="regular">Regular</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={verifiedFilter}
            onValueChange={(value: any) => setVerifiedFilter(value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={`${sortBy}-${sortOrder}`}
            onValueChange={(value) => {
              const [newSortBy, newSortOrder] = value.split("-") as [
                SortBy,
                SortOrder
              ];
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
              <SelectItem value="productCount-desc">Most Products</SelectItem>
              <SelectItem value="productCount-asc">Least Products</SelectItem>
              <SelectItem value="createdAt-desc">Newest</SelectItem>
              <SelectItem value="createdAt-asc">Oldest</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedBrandIds.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-4">
            <Checkbox
              checked={selectedBrandIds.length === brands.length}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm font-medium">
              {selectedBrandIds.length} brand(s) selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={bulkDeleteBrands.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-48 bg-gray-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : brands.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-4">
            <Upload className="h-12 w-12 mx-auto text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No brands found
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? "Try adjusting your search or filters"
              : "Get started by creating your first brand"}
          </p>
          {!searchTerm && (
            <Button onClick={onBrandCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Brand
            </Button>
          )}
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {brands.map((brand) => (
                <BrandCard key={brand._id} brand={brand} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {brands.map((brand) => (
                <BrandRow key={brand._id} brand={brand} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {brands.length} of {totalBrands} brands
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                >
                  Previous
                </Button>

                <span className="text-sm">
                  Page {page} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
