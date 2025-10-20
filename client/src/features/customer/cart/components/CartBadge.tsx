// client/src/features/customer/cart/components/CartBadge.tsx

"use client";

import { ShoppingCart } from "lucide-react";

import Link from "next/link";
import { useCartContext } from "../CartContext";

interface CartBadgeProps {
  className?: string;
  showCount?: boolean;
}

export default function CartBadge({
  className = "",
  showCount = true,
}: CartBadgeProps) {
  const { calculations } = useCartContext();

  return (
    <Link
      href="/cart"
      className={`relative inline-flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition ${className}`}
      aria-label={`Shopping cart with ${calculations.itemCount} items`}
    >
      <ShoppingCart size={24} className="text-gray-700" />

      {showCount && calculations.itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {calculations.itemCount > 99 ? "99+" : calculations.itemCount}
        </span>
      )}
    </Link>
  );
}
