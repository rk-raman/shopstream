// client/src/features/customer/cart/components/MiniCart.tsx

"use client";

import { X, ShoppingBag, Trash2 } from "lucide-react";

import Image from "next/image";
import Link from "next/link";
import { useCartContext } from "../CartContext";

interface MiniCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MiniCart({ isOpen, onClose }: MiniCartProps) {
  const { items, calculations, removeItem } = useCartContext();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Slide-out Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            Shopping Cart ({calculations.itemCount})
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
            aria-label="Close cart"
          >
            <X size={24} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag size={64} className="text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">Your cart is empty</p>
              <button
                onClick={onClose}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-3 pb-4 border-b border-gray-200"
                >
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">
                      Qty: {item.quantity}
                    </p>
                    <p className="font-bold text-gray-900">
                      $
                      {(
                        (item.discountPrice || item.price) * item.quantity
                      ).toFixed(2)}
                    </p>
                  </div>

                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-red-600 hover:text-red-800 p-1 h-fit"
                    aria-label="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-4 space-y-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Subtotal:</span>
              <span className="text-blue-600">
                ${calculations.subtotal.toFixed(2)}
              </span>
            </div>

            <p className="text-xs text-gray-600 text-center">
              Shipping and taxes calculated at checkout
            </p>

            <Link href="/cart" onClick={onClose}>
              <button className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 rounded-lg transition">
                View Cart
              </button>
            </Link>

            <Link href="/checkout" onClick={onClose}>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition">
                Checkout
              </button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
