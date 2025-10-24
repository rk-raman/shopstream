// Global type definitions for ShopStream
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "seller" | "admin";
  avatar?: string;
  phone?: string;
  address?: Address;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  fullName?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  shortDescription?: string;
  basePrice: number;
  discountPrice?: number;
  category: string;
  subcategory?: string;
  brand?: string;
  stock: number;
  sku?: string;
  images: string[];
  tags?: string[];
  specifications?: { name: string; value: string; category?: string }[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  shippingClass?: string;
  freeShipping?: boolean;
  shippingCost?: number;
  lowStockThreshold?: number;
  isDigital?: boolean;
  status: "draft" | "active" | "inactive" | "discontinued";
  seller: string;
  rating: {
    average: number;
    count: number;
  };
  salesCount: number;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  slug: string;
}

export interface Collection {
  _id: string;
  name: string;
  description?: string;
  handle: string;
  type: "manual" | "automated";
  conditions?: CollectionCondition[];
  products: string[] | Product[];
  productCount: number;
  image?: string | { public_id?: string | null; url?: string | null };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  isVisible: boolean;
  sortOrder:
    | "manual"
    | "best-selling"
    | "created-desc"
    | "created-asc"
    | "price-desc"
    | "price-asc"
    | "alphabetical-asc"
    | "alphabetical-desc";
  seller: string;
  isPublished?: boolean;
  viewCount?: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionCondition {
  field: "title" | "type" | "vendor" | "price" | "weight" | "inventory" | "tag";
  operator:
    | "equals"
    | "not_equals"
    | "greater_than"
    | "less_than"
    | "starts_with"
    | "ends_with"
    | "contains"
    | "not_contains";
  value: string | number;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  parent?: string;
  path: string;
  level: number;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  _id: string;
  name: string;
  description?: string;
  logo?: string;
  banner?: string;
  website?: string;
  isVerified: boolean;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isDefault?: boolean;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: string | Product;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  _id: string;
  user: string;
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  shippingAddress: Address;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: string | Product;
  quantity: number;
  price: number;
  total: number;
}

// Form interfaces
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "customer" | "seller";
}

export interface ProductFormData {
  name: string;
  description: string;
  shortDescription?: string;
  basePrice: number;
  discountPrice?: number;
  category: string;
  subcategory?: string;
  brand?: string;
  stock: number;
  sku?: string;
  images: string[];
  tags?: string[];
  specifications?: { name: string; value: string; category?: string }[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  shippingClass?: string;
  freeShipping?: boolean;
  shippingCost?: number;
  lowStockThreshold?: number;
  isDigital?: boolean;
  status?: "draft" | "active" | "inactive" | "discontinued";
}

export interface CollectionFormData {
  name: string;
  description?: string;
  handle?: string;
  type: "manual" | "automated";
  conditions?: CollectionCondition[];
  products?: string[];
  image?: string;
  seoTitle?: string;
  seoDescription?: string;
  isVisible: boolean;
  sortOrder:
    | "manual"
    | "best-selling"
    | "created-desc"
    | "created-asc"
    | "price-desc"
    | "price-asc"
    | "alphabetical-asc"
    | "alphabetical-desc";
}
