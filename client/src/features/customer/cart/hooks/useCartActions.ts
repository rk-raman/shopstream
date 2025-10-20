import { useState } from "react";

import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useCart } from "./useCart";
import { useAuth } from "@/features/auth/context/AuthContext";

export function useCartActions() {
  const router = useRouter();
  const { isCustomerAuthenticated: isAuthenticated } = useAuth();
  const {
    addToCart,
    updateQuantity,
    removeItem,
    isLoading: loading,
  } = useCart();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAddToCart = async (productId: string, quantity: number = 1) => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      router.push(`/login?redirect=/products/${productId}`);
      return false;
    }

    setActionLoading(`add-${productId}`);
    try {
      await addToCart(productId, quantity);
      return true;
    } catch (error) {
      return false;
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    setActionLoading(`update-${itemId}`);
    try {
      await updateQuantity(itemId, quantity);
      return true;
    } catch (error) {
      return false;
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setActionLoading(`remove-${itemId}`);
    try {
      await removeItem(itemId);
      return true;
    } catch (error) {
      return false;
    } finally {
      setActionLoading(null);
    }
  };

  const isActionLoading = (actionKey: string) => actionLoading === actionKey;

  return {
    handleAddToCart,
    handleUpdateQuantity,
    handleRemoveItem,
    isActionLoading,
    loading: loading || actionLoading !== null,
  };
}

// Hook for quick add to cart with quantity selector
export function useQuickAddToCart() {
  const [quantity, setQuantity] = useState(1);
  const { handleAddToCart, loading } = useCartActions();

  const increment = () => setQuantity((prev) => prev + 1);
  const decrement = () => setQuantity((prev) => Math.max(1, prev - 1));
  const setCustomQuantity = (value: number) => setQuantity(Math.max(1, value));

  const addToCart = async (productId: string) => {
    const success = await handleAddToCart(productId, quantity);
    if (success) {
      setQuantity(1); // Reset quantity after successful add
    }
    return success;
  };

  return {
    quantity,
    increment,
    decrement,
    setQuantity: setCustomQuantity,
    addToCart,
    loading,
  };
}
