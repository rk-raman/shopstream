export interface Product {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  images: { url: string; isMain?: boolean }[];
  basePrice: number;
  discountPrice?: number;
  discountPercentage?: number;
  effectivePrice?: number;
  category?: { _id: string; name: string } | string;
  brand?: { _id: string; name: string } | string;
  stock?: number;
  status?: string;
  rating?: {
    average: number;
    count: number;
  };
  seller?: string;
  tags?: string[];

  // Legacy compat (for components that still use these)
  id?: number | string;
  price?: number;
  originalPrice?: number;
  reviews?: number;
  inStock?: boolean;
  image?: string;
}

export interface FilterState {
  categories: string[];
  brands: string[];
  priceRange: [number, number];
  minRating: number;
  search: string;
}

export interface SortOption {
  value: string;
  label: string;
}

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

// Normalize API product to the shape components expect
export function normalizeProduct(p: any): Product {
  const mainImage =
    p.images?.find((img: any) => img.isMain)?.url ||
    p.images?.[0]?.url ||
    "";
  const effectivePrice = p.discountPrice || p.basePrice;
  const hasDiscount = p.discountPrice && p.discountPrice < p.basePrice;

  return {
    ...p,
    _id: p._id,
    id: p._id,
    image: mainImage,
    price: effectivePrice,
    originalPrice: p.basePrice,
    effectivePrice,
    inStock: (p.stock ?? 0) > 0,
    reviews: p.rating?.count || 0,
    rating: p.rating,
    category:
      typeof p.category === "object" ? p.category : p.category,
    brand: typeof p.brand === "object" ? p.brand : p.brand,
  };
}
