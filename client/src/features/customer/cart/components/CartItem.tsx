// client/src/features/customer/cart/components/CartItem.tsx

import Image from "next/image";
import { Trash2, Plus, Minus, AlertCircle } from "lucide-react";
import type { CartItem as CartItemType } from "@/types/cart";
import { ca } from "zod/v4/locales";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  isUpdating?: boolean;
}

export default function CartItem({
  item: cart_item,
  onUpdateQuantity,
  onRemove,
  isUpdating = false,
}: CartItemProps) {
  const item = {
    ...cart_item,
    ...cart_item.product,
    productId: cart_item.product._id,
    image: cart_item.product.images[0].url,
  };
  // console.log("cart item", item);

  const price = item.discountPrice || item.price;
  const hasDiscount = item.discountPrice && item.discountPrice < item.price;

  const handleDecrease = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.productId, item.quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (item.quantity < item.stock) {
      onUpdateQuantity(item.productId, item.quantity + 1);
    }
  };

  const isMaxQuantity = item.quantity >= item.stock;
  const isLowStock = item.stock <= 5 && item.stock > 0;

  return (
    <div className="flex gap-4 py-4 border-b border-gray-200 hover:bg-gray-50 transition px-4 rounded">
      {/* Product Image */}
      <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
        <Image
          src={item.image}
          alt={item.name}
          width={96}
          height={96}
          className="w-full h-full object-cover"
        />
        {item.isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-grow">
        <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{item.category}</p>

        {item.seller && (
          <p className="text-xs text-gray-500 mb-2">
            Sold by: {item.seller.name}
          </p>
        )}

        <div className="flex items-center gap-3 mb-2">
          <span className="text-lg font-bold text-gray-900">
            ${(price * item.quantity).toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-500 line-through">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          )}
        </div>

        <span className="text-sm text-gray-600">${price.toFixed(2)} each</span>

        {/* Stock Warnings */}
        {item.isOutOfStock && (
          <div className="flex items-center gap-1 text-red-600 text-sm font-semibold mt-2">
            <AlertCircle size={16} />
            <span>Out of Stock</span>
          </div>
        )}

        {/* {item.inStock && isLowStock && (
          <div className="flex items-center gap-1 text-orange-600 text-sm mt-2">
            <AlertCircle size={16} />
            <span>Only {item.stock} left in stock</span>
          </div>
        )} */}
      </div>

      {/* Quantity Controls */}
      <div className="flex flex-col items-end gap-3">
        <div
          className={`flex items-center gap-3 border border-gray-300 rounded-lg p-2 ${
            isUpdating ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <button
            onClick={handleDecrease}
            disabled={item.quantity <= 1 || !item.inStock || isUpdating}
            className="text-gray-600 hover:text-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Decrease quantity"
          >
            <Minus size={16} />
          </button>
          <span className="font-semibold text-gray-900 w-6 text-center">
            {item.quantity}
          </span>
          <button
            onClick={handleIncrease}
            disabled={isMaxQuantity || !item.inStock || isUpdating}
            className="text-gray-600 hover:text-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Increase quantity"
          >
            <Plus size={16} />
          </button>
        </div>

        {isMaxQuantity && item.inStock && (
          <span className="text-xs text-orange-600">Max quantity</span>
        )}
      </div>

      {/* Delete Button */}
      <button
        onClick={() => onRemove(item.productId)}
        disabled={isUpdating}
        className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded transition h-fit disabled:opacity-50"
        aria-label="Remove item"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
}
