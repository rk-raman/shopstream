// client/src/types/cart.ts

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  image: string;
  category: string;
  inStock: boolean;
  stock: number;
  seller?: {
    id: string;
    name: string;
  };
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  promoCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartPayload {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemPayload {
  productId: string;
  quantity: number;
}

export interface ApplyPromoCodePayload {
  code: string;
}

export interface CartCalculations {
  subtotal: number;
  discount: number;
  discountAmount: number;
  tax: number;
  shipping: number;
  total: number;
  itemCount: number;
}

export interface PromoCode {
  code: string;
  discount: number;
  type: "percentage" | "fixed";
  minPurchase?: number;
  maxDiscount?: number;
}
