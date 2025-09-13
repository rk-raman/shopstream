"use client";

import React, { useState } from "react";
import {
  Plus,
  Settings,
  BarChart3,
  Building2,
  Users,
  Star,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BrandList } from "@/features/seller/components/Brands/BrandList/BrandList";
import { useBrandStatistics } from "@/features/seller/hooks/useBrands";
import { Brand } from "@/types/global";

interface BrandFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand?: Brand;
}

const BrandFormModal: React.FC<BrandFormModalProps> = ({
  isOpen,
  onClose,
  brand,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{brand ? "Edit Brand" : "Create Brand"}</DialogTitle>
        </DialogHeader>
        <div className="p-6">
          {/* Brand form will be implemented here */}
          <p className="text-gray-500">
            Brand form component will be implemented here...
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const BrandStatistics: React.FC = () => {
  const { data: stats, isLoading } = useBrandStatistics();

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
              <p className="text-sm font-medium text-gray-600">Total Brands</p>
              <p className="text-2xl font-bold">{stats?.totalBrands || 0}</p>
            </div>
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Brands</p>
              <p className="text-2xl font-bold">{stats?.activeBrands || 0}</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Featured Brands
              </p>
              <p className="text-2xl font-bold">{stats?.featuredBrands || 0}</p>
            </div>
            <Star className="h-8 w-8 text-yellow-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Verified Brands
              </p>
              <p className="text-2xl font-bold">{stats?.verifiedBrands || 0}</p>
            </div>
            <Shield className="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const BrandsPage: React.FC = () => {
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | undefined>();

  const handleBrandSelect = (brand: Brand) => {
    setSelectedBrand(brand);
  };

  const handleBrandEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setIsFormModalOpen(true);
  };

  const handleBrandAdd = () => {
    setEditingBrand(undefined);
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setEditingBrand(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Brands</h1>
          <p className="text-gray-600 mt-1">
            Manage your product brands and build customer trust
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>

          <Button onClick={handleBrandAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Brand
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <BrandStatistics />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Brand List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Brand Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BrandList
                onBrandSelect={handleBrandSelect}
                onBrandEdit={handleBrandEdit}
                selectedBrandId={selectedBrand?._id}
                showActions={true}
                showProductCount={true}
                defaultView="grid"
              />
            </CardContent>
          </Card>
        </div>

        {/* Brand Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Brand Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedBrand ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {selectedBrand.logo?.url ? (
                      <img
                        src={selectedBrand.logo.url}
                        alt={selectedBrand.name}
                        className="h-16 w-16 rounded-lg object-cover border"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center border">
                        <Building2 className="h-8 w-8 text-gray-400" />
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">
                          {selectedBrand.name}
                        </h3>
                        {selectedBrand.isVerified && (
                          <Shield className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        @{selectedBrand.slug}
                      </p>
                    </div>
                  </div>

                  {selectedBrand.description && (
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-sm text-gray-600">
                        {selectedBrand.description}
                      </p>
                    </div>
                  )}

                  {selectedBrand.company && (
                    <div>
                      <h4 className="font-medium mb-2">Company Information</h4>
                      <div className="space-y-2 text-sm">
                        {selectedBrand.company.name && (
                          <div>
                            <span className="font-medium">Name:</span>
                            <span className="ml-2">
                              {selectedBrand.company.name}
                            </span>
                          </div>
                        )}
                        {selectedBrand.company.website && (
                          <div>
                            <span className="font-medium">Website:</span>
                            <a
                              href={selectedBrand.company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-blue-600 hover:underline"
                            >
                              {selectedBrand.company.website}
                            </a>
                          </div>
                        )}
                        {selectedBrand.company.email && (
                          <div>
                            <span className="font-medium">Email:</span>
                            <span className="ml-2">
                              {selectedBrand.company.email}
                            </span>
                          </div>
                        )}
                        {selectedBrand.company.phone && (
                          <div>
                            <span className="font-medium">Phone:</span>
                            <span className="ml-2">
                              {selectedBrand.company.phone}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Products:</span>
                      <span className="ml-2">
                        {selectedBrand.productCount || 0}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Followers:</span>
                      <span className="ml-2">
                        {selectedBrand.followerCount || 0}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Views:</span>
                      <span className="ml-2">
                        {selectedBrand.viewCount || 0}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Rating:</span>
                      <span className="ml-2">
                        {selectedBrand.averageRating || 0}/5
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Status:</span>
                      <span
                        className={`ml-2 ${
                          selectedBrand.isActive
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {selectedBrand.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Featured:</span>
                      <span
                        className={`ml-2 ${
                          selectedBrand.isFeatured
                            ? "text-yellow-600"
                            : "text-gray-600"
                        }`}
                      >
                        {selectedBrand.isFeatured ? "Yes" : "No"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Verified:</span>
                      <span
                        className={`ml-2 ${
                          selectedBrand.isVerified
                            ? "text-blue-600"
                            : "text-gray-600"
                        }`}
                      >
                        {selectedBrand.isVerified ? "Yes" : "No"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Categories:</span>
                      <span className="ml-2">
                        {selectedBrand.categories?.length || 0}
                      </span>
                    </div>
                  </div>

                  {selectedBrand.socialMedia &&
                    Object.keys(selectedBrand.socialMedia).length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Social Media</h4>
                        <div className="space-y-2 text-sm">
                          {Object.entries(selectedBrand.socialMedia).map(
                            ([platform, url]) =>
                              url && (
                                <div key={platform}>
                                  <span className="font-medium capitalize">
                                    {platform}:
                                  </span>
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 text-blue-600 hover:underline"
                                  >
                                    {url}
                                  </a>
                                </div>
                              )
                          )}
                        </div>
                      </div>
                    )}

                  <div className="flex gap-2 pt-4">
                    <Button
                      size="sm"
                      onClick={() => handleBrandEdit(selectedBrand)}
                    >
                      Edit Brand
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(`/brands/${selectedBrand.slug}`, "_blank")
                      }
                    >
                      View Public
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a brand to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Brand Form Modal */}
      <BrandFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseModal}
        brand={editingBrand}
      />
    </div>
  );
};

export default BrandsPage;
