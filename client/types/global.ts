/// <reference types="next" />
/// <reference types="next/image-types/global" />

// Global type definitions for ShopStream client

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "customer" | "seller" | "admin";
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Product types
export interface ProductVariant {
  _id?: string;
  name: string;
  value: string;
  price?: number;
  stock?: number;
  sku?: string;
  images?: string[];
}

export interface ProductSpecification {
  name: string;
  value: string;
  category?: string;
}

export interface ProductDimensions {
  length?: number;
  width?: number;
  height?: number;
  unit?: string;
}

export interface ProductSEO {
  title?: string;
  description?: string;
  keywords?: string[];
}

export interface ProductShipping {
  weight?: number;
  dimensions?: ProductDimensions;
  shippingClass?: string;
  freeShipping?: boolean;
  shippingCost?: number;
}

export interface ProductRating {
  average: number;
  count: number;
  breakdown: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface Product {
  id: string;
  _id?: string;
  name: string;
  slug?: string;
  description: string;
  shortDescription?: string;
  basePrice: number;
  discountPrice?: number;
  category: string;
  subcategory?: string;
  brand?: string;
  images: string[];
  videos?: string[];
  stock: number;
  sku?: string;
  tags?: string[];
  specifications?: ProductSpecification[];
  variants?: ProductVariant[];
  seller: {
    id: string;
    name: string;
    avatar?: string;
  };
  rating?: ProductRating;
  reviewCount?: number;
  status: "draft" | "active" | "inactive" | "discontinued";
  isApproved?: boolean;
  isDigital?: boolean;
  weight?: number;
  dimensions?: ProductDimensions;
  shippingClass?: string;
  freeShipping?: boolean;
  shippingCost?: number;
  lowStockThreshold?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  views?: number;
  sales?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  id: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  parent?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Brand {
  _id: string;
  id: string;
  name: string;
  slug?: string;
  description?: string;
  logo?: string;
  website?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Cart types
export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  tax: number;
  total: number;
  updatedAt: string;
}

// Order types
export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: Address;
  billingAddress: Address;
  createdAt: string;
  updatedAt: string;
}

// Address types
export interface Address {
  id?: string;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
  role: string;
}

export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  role: "customer" | "seller";
}

export interface ForgotPasswordForm {
  email: string;
}

export interface ResetPasswordForm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Component prop types
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  loading?: boolean;
}

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

// Navigation types
export interface NavItem {
  title: string;
  href: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

// Theme types
export type Theme = "light" | "dark" | "system";

export {};
