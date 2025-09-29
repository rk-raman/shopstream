"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Upload,
  X,
  Building2,
  Globe,
  Mail,
  Phone,
  Camera,
  Image as ImageIcon,
} from "lucide-react";
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
  useCreateBrand,
  useUpdateBrand,
} from "@/features/seller/hooks/useBrands";
import { useCategories } from "@/features/seller/hooks/useCategories";
import { Brand } from "@/types/global";
import { toast } from "sonner";
import FileUploader from "@/components/shared/FileUploader";
import type { FileUploaderValue } from "@/components/shared/FileUploader";

const brandSchema = z.object({
  name: z
    .string()
    .min(1, "Brand name is required")
    .max(100, "Brand name must be less than 100 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
  description: z.string().optional(),
  shortDescription: z
    .string()
    .max(200, "Short description must be less than 200 characters")
    .optional(),

  // Status
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),

  // Categories & tags
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),

  // Commission
  commission: z
    .number({ invalid_type_error: "Commission must be a number" })
    .min(0, "Commission cannot be negative")
    .max(100, "Commission cannot exceed 100")
    .optional(),

  // Company information (matches companyInfo in model)
  companyFoundedYear: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : Number(v)))
    .refine((v) => v === undefined || (!Number.isNaN(v) && v > 0), {
      message: "Enter a valid year",
    }),
  companyHeadquarters: z.string().optional(),
  companyWebsite: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  companyEmail: z
    .string()
    .email("Must be a valid email")
    .optional()
    .or(z.literal("")),
  companyPhone: z.string().optional(),
  addressStreet: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: z.string().optional(),
  addressCountry: z.string().optional(),
  addressZipCode: z.string().optional(),

  // Social media
  facebook: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  twitter: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  instagram: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  linkedin: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  youtube: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  tiktok: z.string().url("Must be a valid URL").optional().or(z.literal("")),

  // SEO
  metaTitle: z
    .string()
    .max(60, "Meta title cannot exceed 60 characters")
    .optional(),
  metaDescription: z
    .string()
    .max(160, "Meta description cannot exceed 160 characters")
    .optional(),
  metaKeywords: z.string().optional(), // comma separated input -> split into array on submit

  // Guidelines
  logoUsage: z.string().optional(),
  colorPalette: z.string().optional(), // comma separated input -> split into array
  typography: z.string().optional(),
  toneOfVoice: z.string().optional(),
});

type BrandFormData = z.infer<typeof brandSchema>;

interface BrandFormProps {
  brand?: Brand;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const BrandForm: React.FC<BrandFormProps> = ({
  brand,
  onSuccess,
  onCancel,
}) => {
  const [logoImages, setLogoImages] = useState<FileUploaderValue>([]);
  const [bannerImages, setBannerImages] = useState<FileUploaderValue>([]);
  const [galleryImages, setGalleryImages] = useState<FileUploaderValue>([]);

  const { data: categories } = useCategories();
  const createBrandMutation = useCreateBrand();
  const updateBrandMutation = useUpdateBrand();

  const form = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      shortDescription: "",
      isActive: true,
      isFeatured: false,
      categories: [],
      tags: [],
      commission: 0,
      companyFoundedYear: undefined,
      companyHeadquarters: "",
      companyWebsite: "",
      companyEmail: "",
      companyPhone: "",
      addressStreet: "",
      addressCity: "",
      addressState: "",
      addressCountry: "",
      addressZipCode: "",
      facebook: "",
      twitter: "",
      instagram: "",
      linkedin: "",
      youtube: "",
      tiktok: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      logoUsage: "",
      colorPalette: "",
      typography: "",
      toneOfVoice: "",
    },
  });

  // Populate form when editing and set FileUploader defaults
  useEffect(() => {
    if (brand) {
      form.reset({
        name: (brand as any).name || "",
        slug: (brand as any).slug || "",
        description: (brand as any).description || "",
        shortDescription: (brand as any).shortDescription || "",
        isActive: (brand as any).isActive ?? true,
        isFeatured: (brand as any).isFeatured ?? false,
        categories:
          (brand as any).categories?.map((c: any) =>
            typeof c === "string" ? c : c?._id
          ) || [],
        tags: (brand as any).tags || [],
        commission: (brand as any).commission ?? 0,
        companyFoundedYear: (brand as any).companyInfo?.foundedYear,
        companyHeadquarters: (brand as any).companyInfo?.headquarters || "",
        companyWebsite: (brand as any).companyInfo?.website || "",
        companyEmail: (brand as any).companyInfo?.email || "",
        companyPhone: (brand as any).companyInfo?.phone || "",
        addressStreet: (brand as any).companyInfo?.address?.street || "",
        addressCity: (brand as any).companyInfo?.address?.city || "",
        addressState: (brand as any).companyInfo?.address?.state || "",
        addressCountry: (brand as any).companyInfo?.address?.country || "",
        addressZipCode: (brand as any).companyInfo?.address?.zipCode || "",
        facebook: (brand as any).socialMedia?.facebook || "",
        twitter: (brand as any).socialMedia?.twitter || "",
        instagram: (brand as any).socialMedia?.instagram || "",
        linkedin: (brand as any).socialMedia?.linkedin || "",
        youtube: (brand as any).socialMedia?.youtube || "",
        tiktok: (brand as any).socialMedia?.tiktok || "",
        metaTitle: (brand as any).metaTitle || "",
        metaDescription: (brand as any).metaDescription || "",
        metaKeywords: ((brand as any).metaKeywords || []).join(", "),
        logoUsage: (brand as any).guidelines?.logoUsage || "",
        colorPalette: ((brand as any).guidelines?.colorPalette || []).join(
          ", "
        ),
        typography: (brand as any).guidelines?.typography || "",
        toneOfVoice: (brand as any).guidelines?.toneOfVoice || "",
      });

      // Initialize uploaders
      const logo = (brand as any).logo;
      const banner = (brand as any).banner;
      const images = (brand as any).images || [];
      setLogoImages(
        logo?.url ? [{ public_id: logo.public_id || "", url: logo.url }] : []
      );
      setBannerImages(
        banner?.url
          ? [{ public_id: banner.public_id || "", url: banner.url }]
          : []
      );
      setGalleryImages(
        Array.isArray(images)
          ? images
              .filter((i: any) => i && (i.url || typeof i === "string"))
              .map((i: any) =>
                typeof i === "string"
                  ? { public_id: "", url: i }
                  : { public_id: i.public_id || "", url: i.url }
              )
          : []
      );
    }
  }, [brand, form]);

  // Auto-generate slug from name when creating
  const watchName = form.watch("name");
  useEffect(() => {
    if (watchName && !brand) {
      const slug = watchName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      form.setValue("slug", slug);
    }
  }, [watchName, brand, form]);

  const onSubmit = async (data: BrandFormData) => {
    try {
      // Build payload matching Brand.model.js
      const payload: any = {
        name: data.name,
        slug: data.slug,
        description: data.description,
        shortDescription: data.shortDescription,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        categories: data.categories || [],
        tags: data.tags || [],
        commission:
          typeof data.commission === "number" ? data.commission : undefined,
        companyInfo: {
          foundedYear: data.companyFoundedYear,
          headquarters: data.companyHeadquarters,
          website: data.companyWebsite || undefined,
          email: data.companyEmail || undefined,
          phone: data.companyPhone,
          address: {
            street: data.addressStreet,
            city: data.addressCity,
            state: data.addressState,
            country: data.addressCountry,
            zipCode: data.addressZipCode,
          },
        },
        socialMedia: {
          facebook: data.facebook || undefined,
          twitter: data.twitter || undefined,
          instagram: data.instagram || undefined,
          linkedin: data.linkedin || undefined,
          youtube: data.youtube || undefined,
          tiktok: data.tiktok || undefined,
        },
        metaTitle: data.metaTitle || undefined,
        metaDescription: data.metaDescription || undefined,
        metaKeywords: data.metaKeywords
          ? data.metaKeywords
              .split(",")
              .map((k) => k.trim())
              .filter(Boolean)
          : undefined,
        guidelines: {
          logoUsage: data.logoUsage,
          colorPalette: data.colorPalette
            ? data.colorPalette
                .split(",")
                .map((c) => c.trim())
                .filter(Boolean)
            : undefined,
          typography: data.typography,
          toneOfVoice: data.toneOfVoice,
        },
      };

      // Include images like CollectionForm: send objects with url/public_id
      if (logoImages && logoImages.length > 0) {
        payload.logo = logoImages[0];
      }
      if (bannerImages && bannerImages.length > 0) {
        payload.banner = bannerImages[0];
      }
      if (galleryImages && galleryImages.length > 0) {
        payload.images = galleryImages.map((g: any) => ({
          url: g.url,
          public_id: g.public_id,
          caption: (g as any).caption,
        }));
      }

      let saved: Brand;
      if (brand) {
        saved = await updateBrandMutation.mutateAsync({
          id: (brand as any)._id,
          data: payload,
        });
      } else {
        saved = await createBrandMutation.mutateAsync(payload);
      }

      toast.success(
        brand ? "Brand updated successfully!" : "Brand created successfully!"
      );
      onSuccess?.();
    } catch (error) {
      console.error("Error saving brand:", error);
      toast.error("Failed to save brand. Please try again.");
    }
  };

  const isLoading =
    createBrandMutation.isPending || updateBrandMutation.isPending;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="seo">SEO & Guidelines</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Brand Name *</Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    placeholder="Enter brand name"
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
                    placeholder="brand-slug"
                  />
                  {form.formState.errors.slug && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.slug.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="shortDescription">Short Description</Label>
                <Input
                  id="shortDescription"
                  {...form.register("shortDescription")}
                  placeholder="Short summary (<= 200 chars)"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  placeholder="Describe your brand..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="commission">Commission (%)</Label>
                  <Input
                    id="commission"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    {...form.register("commission", { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label>Categories</Label>
                  <Select
                    onValueChange={(val) =>
                      form.setValue(
                        "categories",
                        Array.from(
                          new Set([
                            ...(form.getValues("categories") || []),
                            val,
                          ])
                        )
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category to add" />
                    </SelectTrigger>
                    <SelectContent>
                      {(categories?.data?.docs || []).map((cat: any) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {/* Selected categories preview */}
                  {(form.watch("categories") || []).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(form.watch("categories") || []).map((id) => (
                        <span
                          key={id}
                          className="px-2 py-1 text-xs rounded border"
                        >
                          {categories?.data?.docs.find((c: any) => c._id === id)
                            ?.name || id}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  placeholder="e.g. electronics, premium, lifestyle"
                  value={(form.watch("tags") || []).join(", ")}
                  onChange={(e) =>
                    form.setValue(
                      "tags",
                      e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean)
                    )
                  }
                />
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
              <CardTitle>Brand Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Brand Logo</Label>
                  <FileUploader
                    path="brands/logo"
                    label="Logo"
                    description="Square logo (recommended: 400x400px)"
                    multiple={false}
                    defaultValue={logoImages}
                    onChange={setLogoImages}
                  />
                </div>
                <div>
                  <Label>Brand Banner</Label>
                  <FileUploader
                    path="brands/banner"
                    label="Banner"
                    description="Banner image (recommended: 1200x400px)"
                    multiple={false}
                    defaultValue={bannerImages}
                    onChange={setBannerImages}
                  />
                </div>
              </div>

              <div>
                <Label>Gallery Images</Label>
                <FileUploader
                  path="brands/images"
                  label="Gallery"
                  description="Upload additional brand images"
                  multiple
                  defaultValue={galleryImages}
                  onChange={setGalleryImages}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyFoundedYear">Founded Year</Label>
                  <Input
                    id="companyFoundedYear"
                    type="number"
                    {...form.register("companyFoundedYear")}
                    placeholder="e.g. 1998"
                  />
                </div>
                <div>
                  <Label htmlFor="companyHeadquarters">Headquarters</Label>
                  <Input
                    id="companyHeadquarters"
                    {...form.register("companyHeadquarters")}
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="companyWebsite">Company Website</Label>
                  <Input
                    id="companyWebsite"
                    {...form.register("companyWebsite")}
                    placeholder="https://company.com"
                  />
                  {form.formState.errors.companyWebsite && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.companyWebsite.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="companyEmail">Company Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    {...form.register("companyEmail")}
                    placeholder="info@company.com"
                  />
                  {form.formState.errors.companyEmail && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.companyEmail.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="companyPhone">Company Phone</Label>
                  <Input
                    id="companyPhone"
                    {...form.register("companyPhone")}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="addressStreet">Street</Label>
                  <Input
                    id="addressStreet"
                    {...form.register("addressStreet")}
                  />
                </div>
                <div>
                  <Label htmlFor="addressCity">City</Label>
                  <Input id="addressCity" {...form.register("addressCity")} />
                </div>
                <div>
                  <Label htmlFor="addressState">State</Label>
                  <Input id="addressState" {...form.register("addressState")} />
                </div>
                <div>
                  <Label htmlFor="addressCountry">Country</Label>
                  <Input
                    id="addressCountry"
                    {...form.register("addressCountry")}
                  />
                </div>
                <div>
                  <Label htmlFor="addressZipCode">Zip/Postal Code</Label>
                  <Input
                    id="addressZipCode"
                    {...form.register("addressZipCode")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    {...form.register("facebook")}
                    placeholder="https://facebook.com/yourbrand"
                  />
                </div>
                <div>
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    {...form.register("twitter")}
                    placeholder="https://twitter.com/yourbrand"
                  />
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    {...form.register("instagram")}
                    placeholder="https://instagram.com/yourbrand"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    {...form.register("linkedin")}
                    placeholder="https://linkedin.com/company/yourbrand"
                  />
                </div>
                <div>
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input
                    id="youtube"
                    {...form.register("youtube")}
                    placeholder="https://youtube.com/c/yourbrand"
                  />
                </div>
                <div>
                  <Label htmlFor="tiktok">TikTok</Label>
                  <Input
                    id="tiktok"
                    {...form.register("tiktok")}
                    placeholder="https://tiktok.com/@yourbrand"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  {...form.register("metaTitle")}
                  placeholder="Brand SEO title"
                />
              </div>
              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  {...form.register("metaDescription")}
                  placeholder="Brand SEO description"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="metaKeywords">
                  Meta Keywords (comma separated)
                </Label>
                <Input
                  id="metaKeywords"
                  {...form.register("metaKeywords")}
                  placeholder="electronics, premium, lifestyle"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Brand Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="logoUsage">Logo Usage</Label>
                  <Textarea
                    id="logoUsage"
                    {...form.register("logoUsage")}
                    placeholder="Guidelines for using the logo"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="colorPalette">
                    Color Palette (comma separated)
                  </Label>
                  <Input
                    id="colorPalette"
                    {...form.register("colorPalette")}
                    placeholder="#000000, #FFFFFF, #2E86DE"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="typography">Typography</Label>
                  <Input
                    id="typography"
                    {...form.register("typography")}
                    placeholder="Primary/secondary fonts"
                  />
                </div>
                <div>
                  <Label htmlFor="toneOfVoice">Tone of Voice</Label>
                  <Input
                    id="toneOfVoice"
                    {...form.register("toneOfVoice")}
                    placeholder="Formal, friendly, playful..."
                  />
                </div>
              </div>
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
              {brand ? "Updating..." : "Creating..."}
            </>
          ) : brand ? (
            "Update Brand"
          ) : (
            "Create Brand"
          )}
        </Button>
      </div>
    </form>
  );
};
