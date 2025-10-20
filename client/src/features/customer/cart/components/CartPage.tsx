// client/src/features/customer/cart/components/CartPage.tsx

"use client";

import CartSummary from "./CartSummary";
import PromoCode from "./PromoCode";
import EmptyCart from "./EmptyCart";
import RecommendedProducts from "./RecommendedProducts";
import CartItem from "./CartItem";
import { Loader2 } from "lucide-react";
import { useCartContext } from "../CartContext";
import { Toaster } from "react-hot-toast";

export default function CartPage() {
  const {
    items,
    isLoading,
    error,
    calculations,
    updateQuantity,
    removeItem,
    applyPromoCode,
    removePromoCode,
    cart,
  } = useCartContext();

  // console.log("calculations", calculations);

  const handleApplyPromo = async (code: string) => {
    await applyPromoCode(code);
  };

  if (isLoading && items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-right" reverseOrder={false} />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white rounded-lg">
          <EmptyCart />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">
                  {calculations.itemCount} item
                  {calculations.itemCount !== 1 ? "s" : ""} in cart
                </h2>
              </div>

              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <CartItem
                    key={item.productId}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                    isUpdating={isLoading}
                  />
                ))}
              </div>
            </div>

            {/* Recommended Products */}
            {/* <RecommendedProducts /> */}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <PromoCode
              onApply={handleApplyPromo}
              currentCode={cart?.promoCode}
              onRemove={removePromoCode}
            />

            {cart?.discount && cart.discount > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 font-semibold">
                  ✓ {cart.discount}% discount applied!
                </p>
              </div>
            )}

            <CartSummary
              subtotal={calculations.subtotal}
              discount={calculations.discountAmount}
              tax={calculations.tax}
              shipping={calculations.shipping}
              total={calculations.total}
              itemCount={calculations.itemCount}
            />
          </div>
        </div>
      )}
    </div>
  );
}
