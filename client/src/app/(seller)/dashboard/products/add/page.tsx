"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X, Plus } from "lucide-react";
import {
  createProduct,
  uploadProductImages,
  getCategories,
  getBrands,
} from "@/services/productService";
import { ProductFormData, Category, Brand } from "@/types/global";

interface ProductFormState {
  formData: ProductFormData;
  categories: Category[];
  brands: Brand[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
  imageFiles: File[];
  imagePreviews: string[];
}

export default function AddProductPage() {
  const router = useRouter();
  const [state, setState] = useState<ProductFormState>({
    formData: {
      name: "",
      description: "",
      shortDescription: "",
      basePrice: 0,
      discountPrice: 0,
      category: "",
      subcategory: "",
      brand: "",
      stock: 0,
      sku: "",
      images: [],
      tags: [],
      specifications: [],
      metaTitle: "",
      metaDescription: "",
      metaKeywords: [],
      weight: 0,
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
        unit: "cm",
      },
      shippingClass: "standard",
      freeShipping: false,
      shippingCost: 0,
      lowStockThreshold: 10,
      isDigital: false,
      status: "draft",
    },
    categories: [],
    brands: [],
    loading: true,
    submitting: false,
    error: null,
    imageFiles: [],
    imagePreviews: [],
  });

  // Load categories and brands
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
          getCategories(),
          getBrands(),
        ]);

        setState((prev) => ({
          ...prev,
          categories: categoriesRes.success ? categoriesRes.data : [],
          brands: brandsRes.success ? brandsRes.data : [],
          loading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: "Failed to load form data",
          loading: false,
        }));
      }
    };

    loadData();
  }, []);

  // Handle form field changes
  const handleFieldChange = (field: string, value: any) => {
    setState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value,
      },
    }));
  };

  // Handle nested field changes
  const handleNestedFieldChange = (
    parent: string,
    field: string,
    value: any
  ) => {
    setState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        [parent]: {
          ...prev.formData[parent as keyof ProductFormData],
          [field]: value,
        },
      },
    }));
  };

  // Handle image upload
  const handleImageUpload = (files: FileList) => {
    const newFiles = Array.from(files);
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

    setState((prev) => ({
      ...prev,
      imageFiles: [...prev.imageFiles, ...newFiles],
      imagePreviews: [...prev.imagePreviews, ...newPreviews],
    }));
  };

  // Remove image
  const removeImage = (index: number) => {
    setState((prev) => ({
      ...prev,
      imageFiles: prev.imageFiles.filter((_, i) => i !== index),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index),
    }));
  };

  // Add specification
  const addSpecification = () => {
    setState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        specifications: [
          ...prev.formData.specifications!,
          { name: "", value: "", category: "other" },
        ],
      },
    }));
  };

  // Remove specification
  const removeSpecification = (index: number) => {
    setState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        specifications: prev.formData.specifications!.filter(
          (_, i) => i !== index
        ),
      },
    }));
  };

  // Update specification
  const updateSpecification = (index: number, field: string, value: string) => {
    setState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        specifications: prev.formData.specifications!.map((spec, i) =>
          i === index ? { ...spec, [field]: value } : spec
        ),
      },
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState((prev) => ({ ...prev, submitting: true, error: null }));

    try {
      // Upload images first
      let imageUrls: string[] = [];
      if (state.imageFiles.length > 0) {
        const uploadRes = await uploadProductImages(state.imageFiles);
        if (uploadRes.success) {
          imageUrls = uploadRes.data;
        }
      }

      // Create product
      const productData = {
        ...state.formData,
        images: imageUrls,
        tags: state.formData.tags?.filter((tag) => tag.trim() !== ""),
        specifications: state.formData.specifications?.filter(
          (spec) => spec.name && spec.value
        ),
        metaKeywords: state.formData.metaKeywords?.filter(
          (keyword) => keyword.trim() !== ""
        ),
      };

      const response = await createProduct(productData);

      if (response.success) {
        router.push("/seller/dashboard/products");
      } else {
        setState((prev) => ({
          ...prev,
          error: response.error || "Failed to create product",
        }));
      }
    } catch (error) {
      setState((prev) => ({ ...prev, error: "Failed to create product" }));
    } finally {
      setState((prev) => ({ ...prev, submitting: false }));
    }
  };

  if (state.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-600">Create a new product for your store</p>
        </div>
      </div>

      {/* Error Message */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{state.error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={state.formData.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter product name"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description
              </label>
              <input
                type="text"
                value={state.formData.shortDescription}
                onChange={(e) =>
                  handleFieldChange("shortDescription", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief product description"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                rows={4}
                value={state.formData.description}
                onChange={(e) =>
                  handleFieldChange("description", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Detailed product description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                required
                value={state.formData.category}
                onChange={(e) => handleFieldChange("category", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                {state.categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand
              </label>
              <select
                value={state.formData.brand}
                onChange={(e) => handleFieldChange("brand", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Brand</option>
                {state.brands.map((brand) => (
                  <option key={brand._id} value={brand._id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU
              </label>
              <input
                type="text"
                value={state.formData.sku}
                onChange={(e) => handleFieldChange("sku", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Product SKU"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={state.formData.status}
                onChange={(e) => handleFieldChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Pricing & Inventory</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Price *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={state.formData.basePrice}
                onChange={(e) =>
                  handleFieldChange(
                    "basePrice",
                    parseFloat(e.target.value) || 0
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Price
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={state.formData.discountPrice}
                onChange={(e) =>
                  handleFieldChange(
                    "discountPrice",
                    parseFloat(e.target.value) || 0
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                required
                min="0"
                value={state.formData.stock}
                onChange={(e) =>
                  handleFieldChange("stock", parseInt(e.target.value) || 0)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Low Stock Threshold
              </label>
              <input
                type="number"
                min="0"
                value={state.formData.lowStockThreshold}
                onChange={(e) =>
                  handleFieldChange(
                    "lowStockThreshold",
                    parseInt(e.target.value) || 0
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="10"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDigital"
                checked={state.formData.isDigital}
                onChange={(e) =>
                  handleFieldChange("isDigital", e.target.checked)
                }
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="isDigital" className="ml-2 text-sm text-gray-700">
                Digital Product
              </label>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Product Images</h2>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) =>
                  e.target.files && handleImageUpload(e.target.files)
                }
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">
                  Click to upload images or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, GIF up to 10MB each
                </p>
              </label>
            </div>

            {state.imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {state.imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Specifications</h2>
            <button
              type="button"
              onClick={addSpecification}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Spec
            </button>
          </div>

          <div className="space-y-3">
            {state.formData.specifications?.map((spec, index) => (
              <div key={index} className="flex gap-3 items-center">
                <input
                  type="text"
                  placeholder="Specification name"
                  value={spec.name}
                  onChange={(e) =>
                    updateSpecification(index, "name", e.target.value)
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={spec.value}
                  onChange={(e) =>
                    updateSpecification(index, "value", e.target.value)
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={spec.category}
                  onChange={(e) =>
                    updateSpecification(index, "category", e.target.value)
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="technical">Technical</option>
                  <option value="physical">Physical</option>
                  <option value="performance">Performance</option>
                  <option value="compatibility">Compatibility</option>
                  <option value="other">Other</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeSpecification(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">SEO Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Title
              </label>
              <input
                type="text"
                value={state.formData.metaTitle}
                onChange={(e) => handleFieldChange("metaTitle", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="SEO title (60 characters max)"
                maxLength={60}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description
              </label>
              <textarea
                rows={3}
                value={state.formData.metaDescription}
                onChange={(e) =>
                  handleFieldChange("metaDescription", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="SEO description (160 characters max)"
                maxLength={160}
              />
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={state.submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {state.submitting ? "Creating..." : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
