// client/src/features/customer/cart/utils/cartUtils.ts

import { CartItem, CartCalculations } from "@/types/cart";

const TAX_RATE = 0.08; // 8% tax
const FREE_SHIPPING_THRESHOLD = 50;
const STANDARD_SHIPPING_COST = 9.99;

export const calculateCartTotals = (
  items: CartItem[],
  discountPercent: number = 0
): CartCalculations => {
  if (!items || items.length === 0) {
    return {
      subtotal: 0,
      discount: 0,
      discountAmount: 0,
      tax: 0,
      shipping: 0,
      total: 0,
      itemCount: 0,
    };
  }

  const subtotal = items?.reduce((sum, item) => {
    const price = item.discountPrice || item.price;
    return sum + price * item.quantity;
  }, 0);

  const discountAmount = (subtotal * discountPercent) / 100;
  const subtotalAfterDiscount = subtotal - discountAmount;

  const shipping =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;

  const tax = subtotalAfterDiscount * TAX_RATE;
  const total = subtotalAfterDiscount + tax + shipping;

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    subtotal,
    discount: discountPercent,
    discountAmount,
    tax,
    shipping,
    total,
    itemCount,
  };
};

export const getLocalCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];

  try {
    const cart = localStorage.getItem("guest_cart");
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error("Error reading local cart:", error);
    return [];
  }
};

export const saveLocalCart = (items: CartItem[]): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("guest_cart", JSON.stringify(items));
  } catch (error) {
    console.error("Error saving local cart:", error);
  }
};

export const clearLocalCart = (): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem("guest_cart");
  } catch (error) {
    console.error("Error clearing local cart:", error);
  }
};

export const mergeCartItems = (
  serverItems: CartItem[],
  localItems: CartItem[]
): CartItem[] => {
  const merged = new Map<string, CartItem>();

  // Add server items first
  serverItems.forEach((item) => {
    merged.set(item.productId, item);
  });

  // Merge local items (add quantities if product exists)
  localItems.forEach((localItem) => {
    const existing = merged.get(localItem.productId);
    if (existing) {
      merged.set(localItem.productId, {
        ...existing,
        quantity: Math.min(
          existing.quantity + localItem.quantity,
          existing.stock
        ),
      });
    } else {
      merged.set(localItem.productId, localItem);
    }
  });

  return Array.from(merged.values());
};

export const validateCartItem = (
  item: CartItem
): {
  isValid: boolean;
  error?: string;
} => {
  if (!item.inStock) {
    return { isValid: false, error: "Product is out of stock" };
  }

  if (item.quantity > item.stock) {
    return {
      isValid: false,
      error: `Only ${item.stock} items available in stock`,
    };
  }

  if (item.quantity <= 0) {
    return { isValid: false, error: "Quantity must be greater than 0" };
  }

  return { isValid: true };
};
