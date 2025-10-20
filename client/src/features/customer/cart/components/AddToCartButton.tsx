// client/src/features/customer/cart/components/AddToCartButton.tsx

"use client";

import { useState } from "react";
import { ShoppingCart, Check, Loader2 } from "lucide-react";

import { useRouter } from "next/navigation";
import { useCartContext } from "../CartContext";
import { useAuth } from "@/features/auth/context/AuthContext";

interface AddToCartButtonProps {
  productId: string;
  quantity?: number;
  className?: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  disabled?: boolean;
}

export default function AddToCartButton({
  productId,
  quantity = 1,
  className = "",
  variant = "primary",
  size = "md",
  showIcon = true,
  disabled = false,
}: AddToCartButtonProps) {
  const { addToCart, isLoading } = useCartContext();
  const { isCustomerAuthenticated } = useAuth();
  const router = useRouter();
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = async () => {
    if (!isCustomerAuthenticated) {
      router.push("/login?redirect=/cart");
      return;
    }

    try {
      await addToCart(productId, quantity);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-800 hover:bg-gray-900 text-white",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={disabled || isLoading || justAdded}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        font-semibold rounded-lg transition
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <Loader2 size={iconSizes[size]} className="animate-spin" />
          <span>Adding...</span>
        </>
      ) : justAdded ? (
        <>
          {showIcon && <Check size={iconSizes[size]} />}
          <span>Added!</span>
        </>
      ) : (
        <>
          {showIcon && <ShoppingCart size={iconSizes[size]} />}
          <span>Add to Cart</span>
        </>
      )}
    </button>
  );
}
