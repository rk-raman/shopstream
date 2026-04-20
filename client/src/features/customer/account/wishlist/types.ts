// Matches the populated product from GET /users/wishlist
export interface WishlistProduct {
  _id: string;
  name: string;
  slug?: string;
  images: { url: string; isMain?: boolean }[];
  basePrice: number;
  discountPrice?: number;
  stock?: number;
  status?: string;
  rating?: {
    average: number;
    count: number;
  };
}

// Flattened item shape for UI components
export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  slug?: string;
  image: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  inStock: boolean;
  rating?: number;
  reviewCount?: number;
}

// Convert backend product to UI item
export function toWishlistItem(product: WishlistProduct): WishlistItem {
  const mainImage =
    product.images?.find((img) => img.isMain)?.url ||
    product.images?.[0]?.url ||
    "";
  const price = product.discountPrice || product.basePrice;
  const originalPrice = product.basePrice;
  const hasDiscount = product.discountPrice && product.discountPrice < product.basePrice;
  const discount = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : undefined;

  return {
    id: product._id,
    productId: product._id,
    name: product.name,
    slug: product.slug,
    image: mainImage,
    price,
    originalPrice: hasDiscount ? originalPrice : undefined,
    discount,
    inStock: (product.stock ?? 0) > 0 && product.status === "active",
    rating: product.rating?.average,
    reviewCount: product.rating?.count,
  };
}
