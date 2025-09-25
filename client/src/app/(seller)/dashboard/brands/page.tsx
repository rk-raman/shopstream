"use client";

import React, { useState, useEffect } from "react";
import {
  Award,
  Plus,
  Search,
  Edit,
  Trash2,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Building,
  TrendingUp,
  Users,
  Package,
} from "lucide-react";
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  uploadBrandLogo,
} from "@/services/brandService";
import { Brand, BrandFormData } from "@/types/global";

interface BrandState {
  brands: Brand[];
  filteredBrands: Brand[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  showForm: boolean;
  editingBrand: Brand | null;
  submitting: boolean;
}

interface BrandFormState {
  formData: BrandFormData;
  logoFile: File | null;
  logoPreview: string | null;
}

export default function BrandsPage() {
  const [state, setState] = useState<BrandState>({
    brands: [],
    filteredBrands: [],
    loading: true,
    error: null,
    searchTerm: "",
    showForm: false,
    editingBrand: null,
    submitting: false,
  });

  const [formState, setFormState] = useState<BrandFormState>({
    formData: {
      name: "",
      description: "",
      website: "",
      email: "",
      phone: "",
      logo: "",
      banner: "",
      socialMedia: {
        facebook: "",
        twitter: "",
        instagram: "",
        linkedin: "",
      },
      seo: {
        metaTitle: "",
        metaDescription: "",
        metaKeywords: [],
      },
      status: "active",
      isVerified: false,
    },
    logoFile: null,
    logoPreview: null,
  });

  useEffect(() => {
    loadBrands();
  }, []);

  useEffect(() => {
    if (!state.searchTerm) {
      setState((prev) => ({ ...prev, filteredBrands: prev.brands }));
    } else {
      const filtered = state.brands.filter(
        (brand) =>
          brand.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
          brand.description
            ?.toLowerCase()
            .includes(state.searchTerm.toLowerCase())
      );
      setState((prev) => ({ ...prev, filteredBrands: filtered }));
    }
  }, [state.searchTerm, state.brands]);

  const loadBrands = async () => {
    try {
      const response = await getBrands();
      if (response.success) {
        setState((prev) => ({
          ...prev,
          brands: response.data,
          loading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: response.error || "Failed to load brands",
          loading: false,
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Failed to load brands",
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
          ...prev.formData[parent as keyof BrandFormData],
          [field]: value,
        },
      },
    }));
  };

  const handleLogoUpload = (file: File) => {
    setFormState((prev) => ({
      ...prev,
      logoFile: file,
      logoPreview: URL.createObjectURL(file),
    }));
  };

  const resetForm = () => {
    setFormState({
      formData: {
        name: "",
        description: "",
        website: "",
        email: "",
        phone: "",
        logo: "",
        banner: "",
        socialMedia: {
          facebook: "",
          twitter: "",
          instagram: "",
          linkedin: "",
        },
        seo: {
          metaTitle: "",
          metaDescription: "",
          metaKeywords: [],
        },
        status: "active",
        isVerified: false,
      },
      logoFile: null,
      logoPreview: null,
    });
    setState((prev) => ({
      ...prev,
      showForm: false,
      editingBrand: null,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState((prev) => ({ ...prev, submitting: true, error: null }));

    try {
      let logoUrl = formState.formData.logo;
      if (formState.logoFile) {
        const uploadRes = await uploadBrandLogo(formState.logoFile);
        if (uploadRes.success) {
          logoUrl = uploadRes.data;
        }
      }

      const brandData = {
        ...formState.formData,
        logo: logoUrl,
      };

      let response;
      if (state.editingBrand) {
        response = await updateBrand(state.editingBrand._id, brandData);
      } else {
        response = await createBrand(brandData);
      }

      if (response.success) {
        await loadBrands();
        resetForm();
      } else {
        setState((prev) => ({
          ...prev,
          error: response.error || "Failed to save brand",
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Failed to save brand",
      }));
    } finally {
      setState((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handleEdit = (brand: Brand) => {
    setFormState({
      formData: {
        name: brand.name,
        description: brand.description || "",
        website: brand.website || "",
        email: brand.email || "",
        phone: brand.phone || "",
        logo: brand.logo || "",
        banner: brand.banner || "",
        socialMedia: brand.socialMedia || {
          facebook: "",
          twitter: "",
          instagram: "",
          linkedin: "",
        },
        seo: brand.seo || {
          metaTitle: "",
          metaDescription: "",
          metaKeywords: [],
        },
        status: brand.status,
        isVerified: brand.isVerified || false,
      },
      logoFile: null,
      logoPreview: brand.logo || null,
    });
    setState((prev) => ({
      ...prev,
      editingBrand: brand,
      showForm: true,
    }));
  };

  const handleDelete = async (brandId: string) => {
    if (!confirm("Are you sure you want to delete this brand?")) return;

    try {
      const response = await deleteBrand(brandId);
      if (response.success) {
        await loadBrands();
      } else {
        setState((prev) => ({
          ...prev,
          error: response.error || "Failed to delete brand",
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Failed to delete brand",
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

  const verifiedBrands = state.brands.filter((brand) => brand.isVerified);
  const activeBrands = state.brands.filter(
    (brand) => brand.status === "active"
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
          <p className="text-gray-600">Manage your product brands</p>
        </div>
        <button
          onClick={() => setState((prev) => ({ ...prev, showForm: true }))}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Brand
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Brands</p>
              <p className="text-2xl font-bold text-gray-900">
                {state.brands.length}
              </p>
            </div>
            <Building className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Verified Brands</p>
              <p className="text-2xl font-bold text-gray-900">
                {verifiedBrands.length}
              </p>
            </div>
            <Award className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Brands</p>
              <p className="text-2xl font-bold text-gray-900">
                {activeBrands.length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">
                {state.brands.reduce(
                  (sum, brand) => sum + (brand.productCount || 0),
                  0
                )}
              </p>
            </div>
            <Package className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search brands..."
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

      {/* Brands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.filteredBrands.map((brand) => (
          <div
            key={brand._id}
            className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Building className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      {brand.name}
                      {brand.isVerified && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {brand.productCount || 0} products
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(brand)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(brand._id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {brand.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {brand.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    brand.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {brand.status}
                </span>
                {brand.website && (
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Visit Website
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {state.filteredBrands.length === 0 && (
        <div className="text-center py-12">
          <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No brands found</p>
        </div>
      )}

      {/* Brand Form Modal */}
      {state.showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">
                {state.editingBrand ? "Edit Brand" : "Add New Brand"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.formData.name}
                    onChange={(e) =>
                      handleFormFieldChange("name", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter brand name"
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
                    placeholder="Brand description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={formState.formData.website}
                      onChange={(e) =>
                        handleFormFieldChange("website", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com"
                    />
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
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Logo
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files?.[0] && handleLogoUpload(e.target.files[0])
                    }
                    className="hidden"
                    id="brand-logo"
                  />
                  <label
                    htmlFor="brand-logo"
                    className="cursor-pointer block text-center"
                  >
                    {formState.logoPreview ? (
                      <img
                        src={formState.logoPreview}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded mx-auto mb-2"
                      />
                    ) : (
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    )}
                    <p className="text-gray-600">Click to upload logo</p>
                  </label>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formState.formData.email}
                      onChange={(e) =>
                        handleFormFieldChange("email", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="contact@brand.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formState.formData.phone}
                      onChange={(e) =>
                        handleFormFieldChange("phone", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
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
                    : state.editingBrand
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
