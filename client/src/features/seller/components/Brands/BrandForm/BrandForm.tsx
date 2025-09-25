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
  useUploadBrandLogo,
  useUploadBrandBanner,
} from "@/features/seller/hooks/useBrands";
import { useCategories } from "@/features/seller/hooks/useCategories";
import { Brand } from "@/types/global";
import { toast } from "sonner";

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
  tagline: z
    .string()
    .max(200, "Tagline must be less than 200 characters")
    .optional(),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  email: z.string().email("Must be a valid email").optional().or(z.literal("")),
  phone: z.string().optional(),

  // Company information
  companyName: z.string().optional(),
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
  companyAddress: z.string().optional(),

  // Social media
  facebook: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  twitter: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  instagram: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  linkedin: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  youtube: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  tiktok: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  // Settings
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),

  // Categories
  categories: z.array(z.string()).optional(),

  // Brand guidelines
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  brandGuidelines: z.string().optional(),
});

type BrandFormData = z.infer<typeof brandSchema>;

interface BrandFormProps {
  brand?: Brand;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface ImageUploadProps {
  label: string;
  currentImage?: { url: string; public_id: string };
  onUpload: (file: File) => void;
  isUploading: boolean;
  aspectRatio?: string;
  description?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  currentImage,
  onUpload,
  isUploading,
  aspectRatio = "aspect-square",
  description,
}) => {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((file) => file.type.startsWith("image/"));

    if (imageFile) {
      onUpload(imageFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {description && <p className="text-sm text-gray-500">{description}</p>}

      <div
        className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${
          dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300"
        } ${aspectRatio} flex items-center justify-center`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
      >
        {currentImage ? (
          <div className="relative w-full h-full">
            <img
              src={currentImage.url}
              alt={label}
              className="w-full h-full object-cover rounded"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            {isUploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-2"></div>
            ) : (
              <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            )}
            <p className="text-sm text-gray-500">
              {isUploading
                ? "Uploading..."
                : "Drop image here or click to upload"}
            </p>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
      </div>
    </div>
  );
};

export const BrandForm: React.FC<BrandFormProps> = ({
  brand,
  onSuccess,
  onCancel,
}) => {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const { data: categories } = useCategories();
  const createBrandMutation = useCreateBrand();
  const updateBrandMutation = useUpdateBrand();
  const uploadLogoMutation = useUploadBrandLogo();
  const uploadBannerMutation = useUploadBrandBanner();

  const form = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      tagline: "",
      website: "",
      email: "",
      phone: "",
      companyName: "",
      companyWebsite: "",
      companyEmail: "",
      companyPhone: "",
      companyAddress: "",
      facebook: "",
      twitter: "",
      instagram: "",
      linkedin: "",
      youtube: "",
      tiktok: "",
      isActive: true,
      isFeatured: false,
      categories: [],
      primaryColor: "#000000",
      secondaryColor: "#ffffff",
      brandGuidelines: "",
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (brand) {
      form.reset({
        name: brand.name || "",
        slug: brand.slug || "",
        description: brand.description || "",
        tagline: brand.tagline || "",
        website: brand.website || "",
        email: brand.email || "",
        phone: brand.phone || "",
        companyName: brand.company?.name || "",
        companyWebsite: brand.company?.website || "",
        companyEmail: brand.company?.email || "",
        companyPhone: brand.company?.phone || "",
        companyAddress: brand.company?.address || "",
        facebook: brand.socialMedia?.facebook || "",
        twitter: brand.socialMedia?.twitter || "",
        instagram: brand.socialMedia?.instagram || "",
        linkedin: brand.socialMedia?.linkedin || "",
        youtube: brand.socialMedia?.youtube || "",
        tiktok: brand.socialMedia?.tiktok || "",
        isActive: brand.isActive ?? true,
        isFeatured: brand.isFeatured ?? false,
        categories:
          brand.categories?.map((cat) =>
            typeof cat === "string" ? cat : cat._id
          ) || [],
        primaryColor: brand.brandGuidelines?.primaryColor || "#000000",
        secondaryColor: brand.brandGuidelines?.secondaryColor || "#ffffff",
        brandGuidelines: brand.brandGuidelines?.description || "",
      });
    }
  }, [brand, form]);

  // Auto-generate slug from name
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

  const handleLogoUpload = (file: File) => {
    setLogoFile(file);
  };

  const handleBannerUpload = (file: File) => {
    setBannerFile(file);
  };

  const onSubmit = async (data: BrandFormData) => {
    try {
      let brandData: any = {
        name: data.name,
        slug: data.slug,
        description: data.description,
        tagline: data.tagline,
        website: data.website,
        email: data.email,
        phone: data.phone,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        categories: data.categories,
        company: {
          name: data.companyName,
          website: data.companyWebsite,
          email: data.companyEmail,
          phone: data.companyPhone,
          address: data.companyAddress,
        },
        socialMedia: {
          facebook: data.facebook,
          twitter: data.twitter,
          instagram: data.instagram,
          linkedin: data.linkedin,
          youtube: data.youtube,
          tiktok: data.tiktok,
        },
        brandGuidelines: {
          primaryColor: data.primaryColor,
          secondaryColor: data.secondaryColor,
          description: data.brandGuidelines,
        },
      };

      let savedBrand: Brand;

      if (brand) {
        savedBrand = await updateBrandMutation.mutateAsync({
          id: brand._id,
          data: brandData,
        });
      } else {
        savedBrand = await createBrandMutation.mutateAsync(brandData);
      }

      // Upload logo if provided
      if (logoFile) {
        await uploadLogoMutation.mutateAsync({
          brandId: savedBrand._id,
          logoFile: logoFile,
        });
      }

      // Upload banner if provided
      if (bannerFile) {
        await uploadBannerMutation.mutateAsync({
          brandId: savedBrand._id,
          bannerFile: bannerFile,
        });
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="social">Social & Guidelines</TabsTrigger>
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
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  {...form.register("tagline")}
                  placeholder="Your brand's catchy tagline"
                />
                {form.formState.errors.tagline && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.tagline.message}
                  </p>
                )}
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
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    {...form.register("website")}
                    placeholder="https://yourbrand.com"
                  />
                  {form.formState.errors.website && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.website.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                    placeholder="contact@yourbrand.com"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  {...form.register("phone")}
                  placeholder="+1 (555) 123-4567"
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
                <ImageUpload
                  label="Brand Logo"
                  currentImage={brand?.logo}
                  onUpload={handleLogoUpload}
                  isUploading={uploadLogoMutation.isPending}
                  aspectRatio="aspect-square"
                  description="Square logo (recommended: 400x400px)"
                />

                <ImageUpload
                  label="Brand Banner"
                  currentImage={brand?.banner}
                  onUpload={handleBannerUpload}
                  isUploading={uploadBannerMutation.isPending}
                  aspectRatio="aspect-[3/1]"
                  description="Banner image (recommended: 1200x400px)"
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
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    {...form.register("companyName")}
                    placeholder="Your Company Inc."
                  />
                </div>

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
              </div>

              <div className="grid grid-cols-2 gap-4">
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

              <div>
                <Label htmlFor="companyAddress">Company Address</Label>
                <Textarea
                  id="companyAddress"
                  {...form.register("companyAddress")}
                  placeholder="123 Business St, City, State 12345"
                  rows={3}
                />
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

          <Card>
            <CardHeader>
              <CardTitle>Brand Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <Input
                    id="primaryColor"
                    type="color"
                    {...form.register("primaryColor")}
                    className="h-10"
                  />
                </div>

                <div>
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <Input
                    id="secondaryColor"
                    type="color"
                    {...form.register("secondaryColor")}
                    className="h-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="brandGuidelines">Brand Guidelines</Label>
                <Textarea
                  id="brandGuidelines"
                  {...form.register("brandGuidelines")}
                  placeholder="Describe your brand guidelines, tone of voice, usage rules..."
                  rows={4}
                />
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
