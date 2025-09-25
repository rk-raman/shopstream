"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { X, Plus, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { Collection, CollectionFormData } from "@/types/global";
import {
  createCollection,
  updateCollection,
} from "@/features/seller/services/collectionService";
import { getMyProducts } from "@/features/seller/services/productService";
import FileUploader from "@/components/shared/FileUploader";
import type { FileUploaderValue } from "@/components/shared/FileUploader";

const collectionSchema = z.object({
  name: z.string().min(1, "Collection name is required"),
  description: z.string().optional(),
  handle: z.string().optional(),
  type: z.enum(["manual", "automated"]),
  isVisible: z.boolean(),
  sortOrder: z.enum([
    "manual",
    "best-selling",
    "created-desc",
    "created-asc",
    "price-desc",
    "price-asc",
    "alphabetical-asc",
    "alphabetical-desc",
  ]),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

interface CollectionFormProps {
  collection?: Collection;
  onSave: (collection: Collection) => void;
  onCancel: () => void;
}

export default function CollectionForm({
  collection,
  onSave,
  onCancel,
}: CollectionFormProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [uploadedImages, setUploadedImages] = useState<FileUploaderValue>(
    () => {
      const img: any = (collection as any)?.image;
      if (!img) return [];
      if (typeof img === "string") {
        return [{ public_id: "", url: img }];
      }
      if (img?.url) {
        return [{ public_id: img.public_id || "", url: img.url }];
      }
      return [];
    }
  );

  const queryClient = useQueryClient();
  const isEditing = !!collection;

  const form = useForm<CollectionFormData>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      name: collection?.name || "",
      description: collection?.description || "",
      handle: collection?.handle || "",
      type: collection?.type || "manual",
      isVisible: collection?.isVisible ?? true,
      sortOrder: collection?.sortOrder || "manual",
      seoTitle: collection?.seo?.title || "",
      seoDescription: collection?.seo?.description || "",
    },
  });

  // Generate handle from name
  const watchName = form.watch("name");
  useEffect(() => {
    if (watchName && !isEditing) {
      const handle = watchName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      form.setValue("handle", handle);
    }
  }, [watchName, form, isEditing]);

  // Fetch products for manual collections
  const { data: productsResponse } = useQuery({
    queryKey: ["products", productSearch],
    queryFn: () => getMyProducts({ search: productSearch, limit: 50 }),
    enabled: form.watch("type") === "manual",
  });

  const products = productsResponse?.data?.docs || [];

  // Initialize selected products for editing
  useEffect(() => {
    if (collection && Array.isArray(collection.products)) {
      const productIds = collection.products.map((p) =>
        typeof p === "string" ? p : p._id
      );
      setSelectedProducts(productIds);
    }
  }, [collection]);

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: CollectionFormData) => {
      // Build base payload (do not send image yet; upload separately)
      const basePayload: any = {
        name: data.name,
        description: data.description,
        handle: data.handle,
        type: data.type,
        isVisible: data.isVisible,
        sortOrder: data.sortOrder,
        seo: {
          title: data.seoTitle || "",
          description: data.seoDescription || "",
        },
        products:
          form.watch("type") === "manual" ? selectedProducts : undefined,
      };

      // Include image from FileUploader (first item if present)
      const imagePayload =
        uploadedImages && uploadedImages.length > 0
          ? { image: uploadedImages[0] as any }
          : {};

      if (isEditing && collection) {
        return updateCollection(collection._id, {
          ...basePayload,
          ...imagePayload,
        });
      } else {
        return createCollection({
          ...basePayload,
          ...imagePayload,
        });
      }
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast.success(
        `Collection ${isEditing ? "updated" : "created"} successfully`
      );
      onSave(response.data);
    },
    onError: (error: any) => {
      toast.error(
        error.message ||
          `Failed to ${isEditing ? "update" : "create"} collection`
      );
    },
  });

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const onSubmit = (data: CollectionFormData) => {
    saveMutation.mutate(data);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Edit collection" : "Create collection"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? "Update your collection details"
              : "Group your products to make them easier for customers to find"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
              ? "Update collection"
              : "Create collection"}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Collection details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Collection name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Summer Collection"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe this collection..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="handle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Handle</FormLabel>
                        <FormControl>
                          <Input placeholder="summer-collection" {...field} />
                        </FormControl>
                        <FormDescription>
                          This will be used in the collection URL
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Collection type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select collection type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="manual">Manual</SelectItem>
                            <SelectItem value="automated">Automated</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Manual: Add products manually. Automated: Products
                          added based on conditions.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sortOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sort order</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select sort order" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="manual">Manual</SelectItem>
                            <SelectItem value="best-selling">
                              Best selling
                            </SelectItem>
                            <SelectItem value="created-desc">
                              Newest first
                            </SelectItem>
                            <SelectItem value="created-asc">
                              Oldest first
                            </SelectItem>
                            <SelectItem value="price-desc">
                              Price: High to low
                            </SelectItem>
                            <SelectItem value="price-asc">
                              Price: Low to high
                            </SelectItem>
                            <SelectItem value="alphabetical-asc">
                              A-Z
                            </SelectItem>
                            <SelectItem value="alphabetical-desc">
                              Z-A
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isVisible"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Visibility
                          </FormLabel>
                          <FormDescription>
                            Make this collection visible to customers
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Collection image</CardTitle>
                </CardHeader>
                <CardContent>
                  <FileUploader
                    path="collections/images"
                    label="Collection image"
                    description="Upload an image to represent this collection (recommended: 800x450px)"
                    multiple={false}
                    defaultValue={uploadedImages}
                    onChange={setUploadedImages}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              {form.watch("type") === "manual" ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Add products</CardTitle>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search products..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedProducts.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">
                            Selected products ({selectedProducts.length})
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {selectedProducts.map((productId) => {
                              const product = products.find(
                                (p) => p._id === productId
                              );
                              if (!product) return null;

                              return (
                                <div
                                  key={productId}
                                  className="flex items-center justify-between p-2 border rounded"
                                >
                                  <div className="flex items-center gap-2">
                                    {product.images?.[0] && (
                                      <img
                                        src={product.images[0]}
                                        alt={product.name}
                                        className="w-8 h-8 object-cover rounded"
                                      />
                                    )}
                                    <span className="text-sm">
                                      {product.name}
                                    </span>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      toggleProductSelection(productId)
                                    }
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="font-medium mb-2">Available products</h4>
                        <div className="max-h-96 overflow-y-auto space-y-2">
                          {products
                            .filter(
                              (product) =>
                                !selectedProducts.includes(product._id)
                            )
                            .map((product) => (
                              <div
                                key={product._id}
                                className="flex items-center justify-between p-3 border rounded hover:bg-muted/50 cursor-pointer"
                                onClick={() =>
                                  toggleProductSelection(product._id)
                                }
                              >
                                <div className="flex items-center gap-3">
                                  {product.images?.[0] && (
                                    <img
                                      src={product.images[0]}
                                      alt={product.name}
                                      className="w-12 h-12 object-cover rounded"
                                    />
                                  )}
                                  <div>
                                    <p className="font-medium">
                                      {product.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      ${product.basePrice}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Automated collection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Automated collections will be available in a future
                      update. Products will be automatically added based on
                      conditions you set.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="seo" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Search engine optimization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="seoTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SEO title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Collection SEO title"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          This will appear as the page title in search results
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="seoDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SEO description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Collection SEO description"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          This will appear as the description in search results
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}
