// client/src/features/customer/account/orders/components/OrderEmptyState.tsx

import React from "react";
import Link from "next/link";
import { Package } from "lucide-react";

interface OrderEmptyStateProps {
  message?: string;
  showButton?: boolean;
}

export default function OrderEmptyState({
  message = "No orders found",
  showButton = true,
}: OrderEmptyStateProps) {
  return (
    <div className="text-center py-16">
      <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500 text-lg mb-6">{message}</p>
      {showButton && (
        <Link
          href="/products"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Start Shopping
        </Link>
      )}
    </div>
  );
}
