export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  inStock: boolean;
  rating?: number;
  reviewCount?: number;
}
