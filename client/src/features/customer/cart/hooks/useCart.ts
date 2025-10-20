// client/src/features/customer/cart/hooks/useCart.ts

import { useState, useEffect, useCallback } from "react";

import { CartItem, Cart } from "../types";
import { toast } from "react-hot-toast"; // or your preferred toast library
import cartService from "../../services/cartService";
import {
  calculateCartTotals,
  getLocalCart,
  saveLocalCart,
  clearLocalCart,
  mergeCartItems,
  validateCartItem,
} from "../cartUtils";
import { useAuth } from "@/features/auth/context/AuthContext";

interface UseCartReturn {
  cart: Cart | null;
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  calculations: ReturnType<typeof calculateCartTotals>;

  // Actions
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyPromoCode: (code: string) => Promise<void>;
  removePromoCode: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

export const useCart = (): UseCartReturn => {
  const { user, isCustomerAuthenticated: isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);

  // Calculate totals whenever items or discount changes
  const calculations = calculateCartTotals(items, discount);

  // Load cart data
  const loadCart = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (isAuthenticated) {
        // Load from server
        const response = await cartService.getCart();
        if (response.success && response.data) {
          setCart(response.data);
          setItems(response.data.items);
          setDiscount(response.data.discount || 0);
        }
      } else {
        // Load from localStorage
        const localItems = getLocalCart();
        setItems(localItems);
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Error loading cart:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Sync local cart to server after login
  const syncCartAfterLogin = useCallback(async () => {
    const localItems = getLocalCart();
    if (localItems.length > 0 && isAuthenticated) {
      try {
        const response = await cartService.syncCart(localItems);
        if (response.success && response.data) {
          setCart(response.data);
          setItems(response.data.items);
          clearLocalCart();
          toast.success("Cart synced successfully!");
        }
      } catch (err: any) {
        console.error("Error syncing cart:", err);
        toast.error("Failed to sync cart");
      }
    }
  }, [isAuthenticated]);

  // Load cart on mount and when auth changes
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Sync cart after login
  useEffect(() => {
    if (isAuthenticated && user) {
      syncCartAfterLogin();
    }
  }, [isAuthenticated, user, syncCartAfterLogin]);

  // Add to cart
  const addToCart = useCallback(
    async (productId: string, quantity: number = 1) => {
      setIsLoading(true);
      setError(null);

      try {
        if (isAuthenticated) {
          // Add to server
          const response = await cartService.addToCart({
            productId,
            quantity,
          });

          if (response.success && response.data) {
            setCart(response.data);
            setItems(response.data.items);
            toast.success("Item added to cart!");
          }
        } else {
          // Add to localStorage
          const localItems = getLocalCart();
          const existingIndex = localItems.findIndex(
            (item) => item.productId === productId
          );

          if (existingIndex >= 0) {
            localItems[existingIndex].quantity += quantity;
          } else {
            // Note: You'll need to fetch product details here
            // For now, this is a placeholder
            toast.info("Please login to add items to cart");
            return;
          }

          saveLocalCart(localItems);
          setItems(localItems);
          toast.success("Item added to cart!");
        }
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  // Update quantity
  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      setIsLoading(true);
      setError(null);

      try {
        if (quantity <= 0) {
          await removeItem(productId);
          return;
        }

        if (isAuthenticated) {
          // Update on server
          const response = await cartService.updateCartItem({
            productId,
            quantity,
          });

          if (response.success && response.data) {
            setCart(response.data);
            setItems(response.data.items);
          }
        } else {
          // Update localStorage
          const localItems = getLocalCart();
          const updatedItems = localItems.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          );

          saveLocalCart(updatedItems);
          setItems(updatedItems);
        }
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  // Remove item
  const removeItem = useCallback(
    async (productId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        if (isAuthenticated) {
          // Remove from server
          const response = await cartService.removeFromCart(productId);

          if (response.success && response.data) {
            setCart(response.data);
            setItems(response.data.items);
            toast.success("Item removed from cart");
          }
        } else {
          // Remove from localStorage
          const localItems = getLocalCart();
          const updatedItems = localItems.filter(
            (item) => item.productId !== productId
          );

          saveLocalCart(updatedItems);
          setItems(updatedItems);
          toast.success("Item removed from cart");
        }
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  // Clear cart
  const clearCart = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (isAuthenticated) {
        // Clear on server
        const response = await cartService.clearCart();

        if (response.success) {
          setCart(null);
          setItems([]);
          setDiscount(0);
          toast.success("Cart cleared");
        }
      } else {
        // Clear localStorage
        clearLocalCart();
        setItems([]);
        toast.success("Cart cleared");
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Apply promo code
  const applyPromoCode = useCallback(
    async (code: string) => {
      if (!isAuthenticated) {
        toast.error("Please login to use promo codes");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await cartService.applyPromoCode({ code });

        if (response.success && response.data) {
          setCart(response.data);
          setItems(response.data.items);
          setDiscount(response.data.discount || 0);
          toast.success(`Promo code "${code}" applied!`);
        }
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  // Remove promo code
  const removePromoCode = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await cartService.removePromoCode();

      if (response.success && response.data) {
        setCart(response.data);
        setItems(response.data.items);
        setDiscount(0);
        toast.success("Promo code removed");
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Refresh cart
  const refreshCart = useCallback(async () => {
    await loadCart();
  }, [loadCart]);

  return {
    cart,
    items,
    isLoading,
    error,
    calculations,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    applyPromoCode,
    removePromoCode,
    refreshCart,
  };
};
