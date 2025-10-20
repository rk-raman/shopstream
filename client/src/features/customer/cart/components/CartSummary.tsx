// client/src/features/customer/cart/components/CartSummary.tsx

import Link from "next/link";
import { ShoppingBag, ArrowLeft } from "lucide-react";

interface CartSummaryProps {
  subtotal: number;
  discount?: number;
  tax: number;
  shipping: number;
  total: number;
  itemCount: number;
}

export default function CartSummary({
  subtotal,
  discount = 0,
  tax,
  shipping,
  total,
  itemCount,
}: CartSummaryProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 space-y-4 sticky top-4 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

      <div className="space-y-3">
        <div className="flex justify-between text-gray-700">
          <span>
            Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
          </span>
          <span className="font-semibold">${subtotal.toFixed(2)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span className="font-semibold">-${discount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-gray-700">
          <span>Shipping</span>
          <span className="font-semibold">
            {shipping === 0 ? (
              <span className="text-green-600">FREE</span>
            ) : (
              `$${shipping.toFixed(2)}`
            )}
          </span>
        </div>

        <div className="flex justify-between text-gray-700">
          <span>Tax (8%)</span>
          <span className="font-semibold">${tax.toFixed(2)}</span>
        </div>

        <div className="border-t border-gray-300 pt-3">
          <div className="flex justify-between text-lg">
            <span className="font-bold text-gray-900">Total</span>
            <span className="font-bold text-blue-600">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <Link href="/checkout">
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition mt-6 flex items-center justify-center gap-2">
          <ShoppingBag size={20} />
          Proceed to Checkout
        </button>
      </Link>

      <Link href="/products">
        <button className="w-full border border-gray-300 hover:bg-gray-100 text-gray-900 font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2">
          <ArrowLeft size={18} />
          Continue Shopping
        </button>
      </Link>

      <div className="pt-4 border-t border-gray-300">
        <div className="space-y-2 text-xs text-gray-600">
          <p className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            Free shipping on orders over $50
          </p>
          <p className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            30-day return policy
          </p>
          <p className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            Secure checkout
          </p>
        </div>
      </div>
    </div>
  );
}
