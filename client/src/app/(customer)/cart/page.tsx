import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Cart - ShopStream",
  description: "Review your cart items and proceed to checkout",
};

export default function CartPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">Your cart is empty</p>
        <a
          href="/shop/products"
          className="mt-4 inline-block bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Continue Shopping
        </a>
      </div>
    </div>
  );
}
