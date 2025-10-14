"use client";

import React, { useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

import { Product } from "@/types/global";
import { PRODUCT_CONFIG, VALIDATION } from "@/constants/constants";
import { ProductFormData } from "@/features/seller/services/productService";
import {
  useCreateProduct,
  useUpdateProduct,
} from "@/features/seller/hooks/useProducts";
import { useCategories } from "@/features/seller/hooks/useCategories";
import { useBrands } from "@/features/seller/hooks/useBrands";
import FileUploader, {
  FileUploaderValue,
} from "@/components/shared/FileUploader";

interface ProductFormProps {
  product?: Product;
  onSuccess?: (product: Product) => void;
  onCancel?: () => void;
}

interface FormData extends Omit<ProductFormData, "images" | "specifications"> {
  imageFiles?: FileList;
  tags: string;
  specifications: { name: string; value: string; category?: string }[];
}

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSuccess,
  onCancel,
}) => {
  const [imagePreview, setImagePreview] = useState<string[]>(
    product?.images || []
  );
  const [isUploading, setIsUploading] = useState(false);
  const isEditing = !!product;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      shortDescription: product?.shortDescription || "",
      basePrice: product?.basePrice || 0,
      discountPrice: product?.discountPrice || undefined,
      category: product?.category
        ? String((product as any).category?._id ?? (product as any).category)
        : "",
      subcategory: product?.subcategory
        ? String(
            (product as any).subcategory?._id ?? (product as any).subcategory
          )
        : undefined,
      brand: product?.brand
        ? String((product as any).brand?._id ?? (product as any).brand)
        : "",
      stock: product?.stock || 0,
      sku: product?.sku || "",
      tags: product?.tags?.join(", ") || "",
      specifications: product?.specifications
        ? product.specifications.map((spec) => ({
            name: spec.name,
            value: spec.value,
            category: spec.category || "other",
          }))
        : [{ name: "", value: "", category: "other" }],
      status: product?.status || "draft",
      weight: product?.weight || undefined,
      dimensions: product?.dimensions || undefined,
      shippingClass: product?.shippingClass || "standard",
      freeShipping: product?.freeShipping || false,
      shippingCost: product?.shippingCost || 0,
      lowStockThreshold: product?.lowStockThreshold || 10,
      isDigital: product?.isDigital || false,
      metaTitle: product?.metaTitle || "",
      metaDescription: product?.metaDescription || "",
      metaKeywords: product?.metaKeywords?.join(", ") || "",
    },
  });

  // Fetch categories and brands
  const { data: categoriesData } = useCategories();
  const { data: brandsData } = useBrands();

  // Mutations
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  // FileUploader change handler
  const handleFilesChange = useCallback((assets: FileUploaderValue) => {
    const urls = assets.map((a) => a.url).filter(Boolean);
    setImagePreview(urls);
  }, []);

  const addSpecification = () => {
    const currentSpecs = getValues("specifications");
    setValue("specifications", [
      ...currentSpecs,
      { name: "", value: "", category: "other" },
    ]);
  };

  const removeSpecification = (index: number) => {
    const currentSpecs = getValues("specifications");
    setValue(
      "specifications",
      currentSpecs.filter((_, i) => i !== index)
    );
  };

  const onSubmit = async (data: FormData) => {
    if (imagePreview.length === 0) {
      return;
    }

    // Process form data
    const processedSpecifications = data.specifications
      .filter((spec) => spec.name.trim() && spec.value.trim())
      .map((spec) => ({
        name: spec.name.trim(),
        value: spec.value.trim(),
        category: spec.category || "other",
      }));

    const tags = data.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const metaKeywords = data.metaKeywords
      ? data.metaKeywords
          .split(",")
          .map((keyword) => keyword.trim())
          .filter((keyword) => keyword.length > 0)
      : undefined;

    const productData: ProductFormData = {
      name: data.name.trim(),
      description: data.description.trim(),
      shortDescription: data.shortDescription?.trim() || undefined,
      basePrice: Number(data.basePrice),
      discountPrice: data.discountPrice
        ? Number(data.discountPrice)
        : undefined,
      category: data.category,
      subcategory: data.subcategory || undefined,
      brand: data.brand || undefined,
      stock: Number(data.stock),
      sku: data.sku?.trim() || undefined,
      images: imagePreview,
      tags: tags.length > 0 ? tags : undefined,
      specifications:
        processedSpecifications.length > 0
          ? processedSpecifications
          : undefined,
      status: data.status,
      weight: data.weight ? Number(data.weight) : undefined,
      dimensions: data.dimensions,
      shippingClass: data.shippingClass,
      freeShipping: data.freeShipping,
      shippingCost: Number(data.shippingCost),
      lowStockThreshold: Number(data.lowStockThreshold),
      isDigital: data.isDigital,
      metaTitle: data.metaTitle?.trim() || undefined,
      metaDescription: data.metaDescription?.trim() || undefined,
      metaKeywords: metaKeywords,
    };

    try {
      let response;
      if (isEditing && product) {
        response = await updateProductMutation.mutateAsync({
          id: product.id,
          productData,
        });
      } else {
        response = await createProductMutation.mutateAsync(productData);
      }
      onSuccess?.(response.data!);
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  };

  const categories = categoriesData?.data?.docs || [];
  const brands = brandsData?.data?.docs || [];

  // Get specifications for rendering
  const specificationsFields = watch("specifications");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isEditing ? "Edit Product" : "Create Product"}
            </h1>
            <p className="text-gray-600">
              {isEditing
                ? "Update your product details"
                : "Add a new product to your catalog"}
            </p>
          </div>
        </div>
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={
            isSubmitting ||
            createProductMutation.isPending ||
            updateProductMutation.isPending ||
            isUploading
          }
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isEditing ? "Update Product" : "Create Product"}
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Product Name *
              </label>
              <Input
                {...register("name", {
                  required: "Product name is required",
                  minLength: {
                    value: VALIDATION.NAME_MIN_LENGTH,
                    message: `Name must be at least ${VALIDATION.NAME_MIN_LENGTH} characters`,
                  },
                  maxLength: {
                    value: VALIDATION.NAME_MAX_LENGTH,
                    message: `Name must be less than ${VALIDATION.NAME_MAX_LENGTH} characters`,
                  },
                })}
                placeholder="Enter product name"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Category *
              </label>
              <Controller
                name="category"
                control={control}
                rules={{ required: "Category is required" }}
                render={({ field: { onChange, value } }) => (
                  <select
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    className={`flex h-10 w-full items-center rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                      errors.category ? "border-red-500" : "border-input"
                    }`}
                  >
                    <option value="" disabled>
                      Select category
                    </option>
                    {categories?.map((category: any) => (
                      <option key={category._id} value={String(category._id)}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Brand</label>
              <Controller
                name="brand"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <select
                    value={value || ""}
                    onChange={(e) =>
                      onChange(
                        e.target.value === "no-brand" ? "" : e.target.value
                      )
                    }
                    className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select brand (optional)</option>
                    <option value="no-brand">No Brand</option>
                    {brands?.map((brand: any) => (
                      <option key={brand._id} value={String(brand._id)}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Base Price *
              </label>
              <Input
                type="number"
                step="0.01"
                min={PRODUCT_CONFIG.MIN_PRICE}
                max={PRODUCT_CONFIG.MAX_PRICE}
                {...register("basePrice", {
                  required: "Base price is required",
                  min: {
                    value: PRODUCT_CONFIG.MIN_PRICE,
                    message: `Price must be at least $${PRODUCT_CONFIG.MIN_PRICE}`,
                  },
                  max: {
                    value: PRODUCT_CONFIG.MAX_PRICE,
                    message: `Price must be less than $${PRODUCT_CONFIG.MAX_PRICE}`,
                  },
                })}
                placeholder="0.00"
                className={errors.basePrice ? "border-red-500" : ""}
              />
              {errors.basePrice && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.basePrice.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Discount Price
              </label>
              <Input
                type="number"
                step="0.01"
                min={PRODUCT_CONFIG.MIN_PRICE}
                max={PRODUCT_CONFIG.MAX_PRICE}
                {...register("discountPrice")}
                placeholder="0.00 (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Stock Quantity *
              </label>
              <Input
                type="number"
                min={PRODUCT_CONFIG.MIN_STOCK}
                max={PRODUCT_CONFIG.MAX_STOCK}
                {...register("stock", {
                  required: "Stock quantity is required",
                  min: {
                    value: PRODUCT_CONFIG.MIN_STOCK,
                    message: `Stock must be at least ${PRODUCT_CONFIG.MIN_STOCK}`,
                  },
                  max: {
                    value: PRODUCT_CONFIG.MAX_STOCK,
                    message: `Stock must be less than ${PRODUCT_CONFIG.MAX_STOCK}`,
                  },
                })}
                placeholder="0"
                className={errors.stock ? "border-red-500" : ""}
              />
              {errors.stock && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.stock.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">SKU</label>
              <Input
                {...register("sku")}
                placeholder="Product SKU (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Controller
                name="status"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <select
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="" disabled>
                      Select status
                    </option>
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="discontinued">Discontinued</option>
                  </select>
                )}
              />
            </div>
          </div>
        </Card>

        {/* Description */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Description</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Product Description *
              </label>
              <textarea
                {...register("description", {
                  required: "Description is required",
                  maxLength: {
                    value: VALIDATION.DESCRIPTION_MAX_LENGTH,
                    message: `Description must be less than ${VALIDATION.DESCRIPTION_MAX_LENGTH} characters`,
                  },
                })}
                rows={6}
                placeholder="Describe your product in detail..."
                className={`w-full px-3 py-2 border rounded-md resize-none ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Short Description
              </label>
              <textarea
                {...register("shortDescription")}
                rows={3}
                placeholder="Brief product summary (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
              />
            </div>
          </div>
        </Card>

        {/* Images */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Product Images</h2>
          <FileUploader
            path="products"
            multiple
            accept={PRODUCT_CONFIG.ALLOWED_IMAGE_TYPES.join(",")}
            maxFiles={PRODUCT_CONFIG.MAX_IMAGES}
            defaultValue={(product?.images || []).map((url) => ({
              public_id: "",
              url,
            }))}
            onChange={handleFilesChange}
            onUploadingChange={setIsUploading}
          />
        </Card>

        {/* Tags */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Tags</h2>
          <div>
            <label className="block text-sm font-medium mb-2">
              Product Tags
            </label>
            <Input
              {...register("tags")}
              placeholder="Enter tags separated by commas (e.g., electronics, smartphone, android)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate multiple tags with commas
            </p>
          </div>
        </Card>

        {/* Specifications */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Specifications</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSpecification}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Specification
            </Button>
          </div>
          <div className="space-y-3">
            {specificationsFields?.map((spec, index) => (
              <div key={index} className="flex gap-3">
                <Input
                  {...register(`specifications.${index}.name`)}
                  placeholder="Specification name"
                  className="flex-1"
                />
                <Input
                  {...register(`specifications.${index}.value`)}
                  placeholder="Specification value"
                  className="flex-1"
                />
                <Controller
                  name={`specifications.${index}.category`}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <select
                      value={value || ""}
                      onChange={(e) => onChange(e.target.value)}
                      className="w-32 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="" disabled>
                        Category
                      </option>
                      <option value="technical">Technical</option>
                      <option value="physical">Physical</option>
                      <option value="performance">Performance</option>
                      <option value="compatibility">Compatibility</option>
                      <option value="other">Other</option>
                    </select>
                  )}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeSpecification(index)}
                  disabled={specificationsFields.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* SEO */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">SEO Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Meta Title
              </label>
              <Input
                {...register("metaTitle")}
                placeholder="SEO title (optional)"
                maxLength={60}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Meta Description
              </label>
              <textarea
                {...register("metaDescription")}
                rows={3}
                placeholder="SEO description (optional)"
                maxLength={160}
                className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Meta Keywords
              </label>
              <Input
                {...register("metaKeywords")}
                placeholder="SEO keywords separated by commas (optional)"
              />
            </div>
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              createProductMutation.isPending ||
              updateProductMutation.isPending ||
              isUploading
            }
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isEditing ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </form>
    </div>
  );
};
