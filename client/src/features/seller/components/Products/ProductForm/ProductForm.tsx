"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Upload, Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Product } from "@/types/global";
import { PRODUCT_CONFIG, VALIDATION } from "@/constants/constants";
import {
  productService,
  ProductFormData,
} from "@/features/seller/services/productService";

interface ProductFormProps {
  product?: Product;
  onSuccess?: (product: Product) => void;
  onCancel?: () => void;
}

interface FormData extends Omit<ProductFormData, "images"> {
  imageFiles?: FileList;
  tags: string;
  specifications: { key: string; value: string }[];
}

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSuccess,
  onCancel,
}) => {
  const queryClient = useQueryClient();
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
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price || 0,
      originalPrice: product?.originalPrice || undefined,
      category: product?.category || "",
      subcategory: product?.subcategory || "",
      stock: product?.stock || 0,
      tags: product?.tags?.join(", ") || "",
      specifications: product?.specifications
        ? Object.entries(product.specifications).map(([key, value]) => ({
            key,
            value,
          }))
        : [{ key: "", value: "" }],
      isActive: product?.isActive ?? true,
    },
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => productService.getCategories(),
  });

  // Create/Update product mutation
  const saveProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      if (isEditing && product) {
        return productService.updateProduct(product.id, data);
      } else {
        return productService.createProduct(data);
      }
    },
    onSuccess: (response) => {
      toast.success(
        isEditing
          ? "Product updated successfully"
          : "Product created successfully"
      );
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onSuccess?.(response.data!);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save product");
    },
  });

  // Upload images mutation
  const uploadImagesMutation = useMutation({
    mutationFn: (files: File[]) => productService.uploadImages(files),
    onSuccess: (response) => {
      const newImages = response.data || [];
      setImagePreview((prev) => [...prev, ...newImages]);
      toast.success("Images uploaded successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload images");
    },
  });

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      if (!PRODUCT_CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}`);
        return false;
      }
      if (file.size > PRODUCT_CONFIG.MAX_IMAGE_SIZE) {
        toast.error(`File too large: ${file.name}`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Check total image limit
    if (imagePreview.length + validFiles.length > PRODUCT_CONFIG.MAX_IMAGES) {
      toast.error(`Maximum ${PRODUCT_CONFIG.MAX_IMAGES} images allowed`);
      return;
    }

    setIsUploading(true);
    try {
      await uploadImagesMutation.mutateAsync(validFiles);
    } finally {
      setIsUploading(false);
      // Reset file input
      event.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
  };

  const addSpecification = () => {
    const currentSpecs = watch("specifications");
    setValue("specifications", [...currentSpecs, { key: "", value: "" }]);
  };

  const removeSpecification = (index: number) => {
    const currentSpecs = watch("specifications");
    setValue(
      "specifications",
      currentSpecs.filter((_, i) => i !== index)
    );
  };

  const onSubmit = async (data: FormData) => {
    if (imagePreview.length === 0) {
      toast.error("At least one product image is required");
      return;
    }

    // Process form data
    const specifications = data.specifications
      .filter((spec) => spec.key.trim() && spec.value.trim())
      .reduce((acc, spec) => {
        acc[spec.key.trim()] = spec.value.trim();
        return acc;
      }, {} as Record<string, string>);

    const tags = data.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const productData: ProductFormData = {
      name: data.name.trim(),
      description: data.description.trim(),
      price: Number(data.price),
      originalPrice: data.originalPrice
        ? Number(data.originalPrice)
        : undefined,
      category: data.category,
      subcategory: data.subcategory || undefined,
      stock: Number(data.stock),
      images: imagePreview,
      tags: tags.length > 0 ? tags : undefined,
      specifications:
        Object.keys(specifications).length > 0 ? specifications : undefined,
      isActive: data.isActive,
    };

    await saveProductMutation.mutateAsync(productData);
  };

  const categories = categoriesData?.data || [];

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
          disabled={isSubmitting || saveProductMutation.isPending}
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
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      className={errors.category ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Subcategory
              </label>
              <Input
                {...register("subcategory")}
                placeholder="Enter subcategory (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Price *</label>
              <Input
                type="number"
                step="0.01"
                min={PRODUCT_CONFIG.MIN_PRICE}
                max={PRODUCT_CONFIG.MAX_PRICE}
                {...register("price", {
                  required: "Price is required",
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
                className={errors.price ? "border-red-500" : ""}
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.price.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Original Price
              </label>
              <Input
                type="number"
                step="0.01"
                min={PRODUCT_CONFIG.MIN_PRICE}
                max={PRODUCT_CONFIG.MAX_PRICE}
                {...register("originalPrice")}
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

            <div className="flex items-center space-x-2">
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <label className="text-sm font-medium">Active Product</label>
            </div>
          </div>
        </Card>

        {/* Description */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Description</h2>
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
        </Card>

        {/* Images */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Product Images</h2>
          <div className="space-y-4">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Upload Images * (Max {PRODUCT_CONFIG.MAX_IMAGES})
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept={PRODUCT_CONFIG.ALLOWED_IMAGE_TYPES.join(",")}
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={
                    isUploading ||
                    imagePreview.length >= PRODUCT_CONFIG.MAX_IMAGES
                  }
                />
                <label
                  htmlFor="image-upload"
                  className={`cursor-pointer flex flex-col items-center ${
                    isUploading ||
                    imagePreview.length >= PRODUCT_CONFIG.MAX_IMAGES
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {isUploading ? "Uploading..." : "Click to upload images"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, WebP up to{" "}
                    {PRODUCT_CONFIG.MAX_IMAGE_SIZE / (1024 * 1024)}MB each
                  </p>
                </label>
              </div>
            </div>

            {/* Image Preview */}
            {imagePreview.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreview.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
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
            {watch("specifications").map((spec, index) => (
              <div key={index} className="flex gap-3">
                <Input
                  {...register(`specifications.${index}.key`)}
                  placeholder="Specification name"
                  className="flex-1"
                />
                <Input
                  {...register(`specifications.${index}.value`)}
                  placeholder="Specification value"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeSpecification(index)}
                  disabled={watch("specifications").length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || saveProductMutation.isPending}
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
