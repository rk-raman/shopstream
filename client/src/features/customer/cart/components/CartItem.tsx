import Image from "next/image";
import { Trash2, Plus, Minus } from "lucide-react";
import type { CartItem as CartItemType } from "@/data/cartItems";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export default function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) {
  return (
    <div className="flex gap-4 py-4 border-b border-gray-200 hover:bg-gray-50 transition px-4 rounded">
      {/* Product Image */}
      <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
        <Image
          src={item.image}
          alt={item.name}
          width={96}
          height={96}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Details */}
      <div className="flex-grow">
        <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{item.category}</p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            ${(item.price * item.quantity).toFixed(2)}
          </span>
          <span className="text-sm text-gray-600">
            ${item.price.toFixed(2)} each
          </span>
        </div>

        {!item.inStock && (
          <p className="text-red-600 text-sm font-semibold mt-2">
            Out of Stock
          </p>
        )}
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-3 border border-gray-300 rounded-lg p-2">
        <button
          onClick={() =>
            onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))
          }
          className="text-gray-600 hover:text-gray-900 transition"
          aria-label="Decrease quantity"
        >
          <Minus size={16} />
        </button>
        <span className="font-semibold text-gray-900 w-6 text-center">
          {item.quantity}
        </span>
        <button
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          className="text-gray-600 hover:text-gray-900 transition"
          aria-label="Increase quantity"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Delete Button */}
      <button
        onClick={() => onRemove(item.id)}
        className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded transition"
        aria-label="Remove item"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
}
