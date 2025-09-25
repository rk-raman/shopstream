"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, X, FolderTree, Camera, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateCategory,
  useUpdateCategory,
  useUploadCategoryImage,
  useCategoryTree,
} from "@/features/seller/hooks/useCategories";
import { Category } from "@/types/global";
import { toast } from "sonner";
import FileUploader from "@/components/shared/FileUploader";
import type { FileUploaderValue } from "@/components/shared/FileUploader";
import {
  uploadSingleToFolder,
  extractSingleUploadUrl,
} from "@/lib/uploads/uploadClient";

const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name must be less than 100 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
  description: z.string().optional(),
  icon: z.string().optional(),
  parentId: z.string().optional(),

  // SEO fields
  metaTitle: z
    .string()
    .max(60, "Meta title must be less than 60 characters")
    .optional(),
  metaDescription: z
    .string()
    .max(160, "Meta description must be less than 160 characters")
    .optional(),
  metaKeywords: z.string().optional(),

  // Settings
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),

  // Commission
  commissionRate: z
    .number()
    .min(0, "Commission rate must be positive")
    .max(100, "Commission rate cannot exceed 100%")
    .optional(),
  commissionType: z.enum(["percentage", "fixed"]).optional(),

  // Attributes
  attributes: z
    .array(
      z.object({
        name: z.string().min(1, "Attribute name is required"),
        type: z.enum(["text", "number", "select", "multiselect", "boolean"]),
        required: z.boolean().default(false),
        options: z.array(z.string()).optional(),
      })
    )
    .optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: Category;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  parentId,
  onSuccess,
  onCancel,
}) => {
  const [uploadedImages, setUploadedImages] = useState<FileUploaderValue>(
    category?.image?.public_id && category?.image?.url
      ? [{ public_id: category.image.public_id, url: category.image.url }]
      : []
  );
  const [attributes, setAttributes] = useState<any[]>([]);

  const { data: categoryTree } = useCategoryTree();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const uploadImageMutation = useUploadCategoryImage();

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      icon: "",
      parentId: parentId || "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      isActive: true,
      isFeatured: false,
      commissionRate: 0,
      commissionType: "percentage",
      attributes: [],
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name || "",
        slug: category.slug || "",
        description: category.description || "",
        icon: category.icon || "",
        parentId: category.parent?._id || category.parent || "",
        metaTitle: category.seo?.metaTitle || "",
        metaDescription: category.seo?.metaDescription || "",
        metaKeywords: category.seo?.metaKeywords || "",
        isActive: category.isActive ?? true,
        isFeatured: category.isFeatured ?? false,
        commissionRate: category.commission?.rate || 0,
        commissionType: category.commission?.type || "percentage",
        attributes: category.attributes || [],
      });
      setAttributes(category.attributes || []);
    }
  }, [category, form]);

  // Auto-generate slug from name
  const watchName = form.watch("name");
  useEffect(() => {
    if (watchName && !category) {
      const slug = watchName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      form.setValue("slug", slug);
    }
  }, [watchName, category, form]);

  const addAttribute = () => {
    const newAttribute = {
      name: "",
      type: "text" as const,
      required: false,
      options: [],
    };
    setAttributes([...attributes, newAttribute]);
  };

  const updateAttribute = (index: number, field: string, value: any) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[index] = { ...updatedAttributes[index], [field]: value };
    setAttributes(updatedAttributes);
    form.setValue("attributes", updatedAttributes);
  };

  const removeAttribute = (index: number) => {
    const updatedAttributes = attributes.filter((_, i) => i !== index);
    setAttributes(updatedAttributes);
    form.setValue("attributes", updatedAttributes);
  };

  const addAttributeOption = (attributeIndex: number) => {
    const updatedAttributes = [...attributes];
    if (!updatedAttributes[attributeIndex].options) {
      updatedAttributes[attributeIndex].options = [];
    }
    updatedAttributes[attributeIndex].options.push("");
    setAttributes(updatedAttributes);
  };

  const updateAttributeOption = (
    attributeIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[attributeIndex].options[optionIndex] = value;
    setAttributes(updatedAttributes);
    form.setValue("attributes", updatedAttributes);
  };

  const removeAttributeOption = (
    attributeIndex: number,
    optionIndex: number
  ) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[attributeIndex].options.splice(optionIndex, 1);
    setAttributes(updatedAttributes);
    form.setValue("attributes", updatedAttributes);
  };

  // Get available parent categories (excluding current category and its descendants)
  const getAvailableParents = (
    tree: Category[],
    currentId?: string
  ): Category[] => {
    const result: Category[] = [];

    const traverse = (categories: Category[], level = 0) => {
      if (level >= 2) return; // Max 3 levels (0, 1, 2)

      categories.forEach((cat) => {
        if (cat._id !== currentId) {
          result.push(cat);
          if (cat.children) {
            traverse(cat.children, level + 1);
          }
        }
      });
    };

    traverse(tree);
    return result;
  };

  const onSubmit = async (data: CategoryFormData) => {
    try {
      let categoryData: any = {
        name: data.name,
        slug: data.slug,
        description: data.description,
        icon: data.icon,
        parent: data.parentId || null,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        seo: {
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          metaKeywords: data.metaKeywords,
        },
        commission: {
          rate: data.commissionRate,
          type: data.commissionType,
        },
        attributes: attributes.filter((attr) => attr.name.trim()),
      };

      // Include image from FileUploader (first item)
      if (uploadedImages.length > 0) {
        categoryData.image = uploadedImages[0];
      }

      let savedCategory: Category;

      if (category) {
        savedCategory = await updateCategoryMutation.mutateAsync({
          id: category._id,
          data: categoryData,
        });
      } else {
        savedCategory = await createCategoryMutation.mutateAsync(categoryData);
      }

      // Image is already embedded via FileUploader; no extra upload required

      toast.success(
        category
          ? "Category updated successfully!"
          : "Category created successfully!"
      );
      onSuccess?.();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Failed to save category. Please try again.");
    }
  };

  const isLoading =
    createCategoryMutation.isPending || updateCategoryMutation.isPending;
  const availableParents = categoryTree
    ? getAvailableParents(categoryTree, category?._id)
    : [];

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="media">Media & SEO</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="attributes">Attributes</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Category Name *</Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    placeholder="Enter category name"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    {...form.register("slug")}
                    placeholder="category-slug"
                  />
                  {form.formState.errors.slug && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.slug.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  placeholder="Describe this category..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="icon">Icon (Emoji)</Label>
                  <Input
                    id="icon"
                    {...form.register("icon")}
                    placeholder="📦"
                    maxLength={2}
                  />
                </div>

                <div>
                  <Label htmlFor="parentId">Parent Category</Label>
                  <Select
                    value={form.watch("parentId") || "__none__"}
                    onValueChange={(value) =>
                      form.setValue(
                        "parentId",
                        value === "__none__" ? "" : value
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent category (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">
                        No Parent (Root Category)
                      </SelectItem>
                      {availableParents.map((parent) => (
                        <SelectItem key={parent._id} value={parent._id}>
                          {"  ".repeat(parent.level || 0)}
                          {parent.icon} {parent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={form.watch("isActive")}
                    onCheckedChange={(checked) =>
                      form.setValue("isActive", checked)
                    }
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isFeatured"
                    checked={form.watch("isFeatured")}
                    onCheckedChange={(checked) =>
                      form.setValue("isFeatured", checked)
                    }
                  />
                  <Label htmlFor="isFeatured">Featured</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Image</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUploader
                path="categories/images"
                label="Category Image"
                description="Upload an image to represent this category (recommended: 800x450px)"
                multiple={false}
                defaultValue={uploadedImages}
                onChange={setUploadedImages}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  {...form.register("metaTitle")}
                  placeholder="SEO title for search engines"
                  maxLength={60}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {form.watch("metaTitle")?.length || 0}/60 characters
                </p>
                {form.formState.errors.metaTitle && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.metaTitle.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  {...form.register("metaDescription")}
                  placeholder="SEO description for search engines"
                  rows={3}
                  maxLength={160}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {form.watch("metaDescription")?.length || 0}/160 characters
                </p>
                {form.formState.errors.metaDescription && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.metaDescription.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="metaKeywords">Meta Keywords</Label>
                <Input
                  id="metaKeywords"
                  {...form.register("metaKeywords")}
                  placeholder="keyword1, keyword2, keyword3"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate keywords with commas
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commission Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="commissionType">Commission Type</Label>
                  <Select
                    value={form.watch("commissionType")}
                    onValueChange={(value) =>
                      form.setValue(
                        "commissionType",
                        value as "percentage" | "fixed"
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="commissionRate">
                    Commission Rate{" "}
                    {form.watch("commissionType") === "percentage"
                      ? "(%)"
                      : "($)"}
                  </Label>
                  <Input
                    id="commissionRate"
                    type="number"
                    step="0.01"
                    min="0"
                    max={
                      form.watch("commissionType") === "percentage"
                        ? "100"
                        : undefined
                    }
                    {...form.register("commissionRate", {
                      valueAsNumber: true,
                    })}
                    placeholder="0.00"
                  />
                  {form.formState.errors.commissionRate && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.commissionRate.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attributes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Category Attributes
                <Button type="button" onClick={addAttribute} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Attribute
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {attributes.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No attributes defined. Add attributes to help categorize
                  products.
                </p>
              ) : (
                attributes.map((attribute, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Attribute {index + 1}</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeAttribute(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Name</Label>
                          <Input
                            value={attribute.name}
                            onChange={(e) =>
                              updateAttribute(index, "name", e.target.value)
                            }
                            placeholder="Attribute name"
                          />
                        </div>

                        <div>
                          <Label>Type</Label>
                          <Select
                            value={attribute.type}
                            onValueChange={(value) =>
                              updateAttribute(index, "type", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="select">Select</SelectItem>
                              <SelectItem value="multiselect">
                                Multi-select
                              </SelectItem>
                              <SelectItem value="boolean">Boolean</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center space-x-2 pt-6">
                          <Switch
                            checked={attribute.required}
                            onCheckedChange={(checked) =>
                              updateAttribute(index, "required", checked)
                            }
                          />
                          <Label>Required</Label>
                        </div>
                      </div>

                      {(attribute.type === "select" ||
                        attribute.type === "multiselect") && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label>Options</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addAttributeOption(index)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add Option
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {attribute.options?.map((option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className="flex items-center gap-2"
                              >
                                <Input
                                  value={option}
                                  onChange={(e) =>
                                    updateAttributeOption(
                                      index,
                                      optionIndex,
                                      e.target.value
                                    )
                                  }
                                  placeholder={`Option ${optionIndex + 1}`}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    removeAttributeOption(index, optionIndex)
                                  }
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              {category ? "Updating..." : "Creating..."}
            </>
          ) : category ? (
            "Update Category"
          ) : (
            "Create Category"
          )}
        </Button>
      </div>
    </form>
  );
};
