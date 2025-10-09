"use client";

import { useState, useMemo } from "react";
import CartSummary from "./CartSummary";
import PromoCode from "./PromoCode";
import EmptyCart from "./EmptyCart";
import RecommendedProducts from "./RecommendedProducts";
import { ShoppingCart } from "lucide-react";
import { initialCartItems } from "@/lib/data/product";
import CartItem from "./CartItem";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(initialCartItems);
  const [discount, setDiscount] = useState(0);

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      setItems(items.filter((item) => item.id !== id));
    } else {
      setItems(
        items.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  };

  const handleRemove = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleApplyPromo = (code: string, discountPercent: number) => {
    setDiscount(discountPercent);
  };

  const calculations = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shipping = subtotal > 50 ? 0 : 9.99;
    const discountAmount = (subtotal * discount) / 100;
    const tax = (subtotal - discountAmount) * 0.08;
    const total = subtotal - discountAmount + tax + shipping;

    return {
      subtotal,
      shipping,
      tax,
      total,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }, [items, discount]);

  return (
    <>
      {/* Main Content */}
      <div>
        {items.length === 0 ? (
          <div className="bg-white rounded-lg">
            <EmptyCart />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900">
                    {calculations.itemCount} item
                    {calculations.itemCount !== 1 ? "s" : ""} in cart
                  </h2>
                </div>

                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemove}
                  />
                ))}
              </div>

              {/* Recommended Products */}
              <RecommendedProducts />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <PromoCode onApply={handleApplyPromo} />

              {discount > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-green-800 font-semibold">
                    ✓ {discount}% discount applied!
                  </p>
                </div>
              )}

              <CartSummary
                subtotal={calculations.subtotal}
                tax={calculations.tax}
                shipping={calculations.shipping}
                total={calculations.total}
                itemCount={calculations.itemCount}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
