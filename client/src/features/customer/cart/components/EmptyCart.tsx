import { ShoppingCart } from "lucide-react";

export default function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <ShoppingCart size={64} className="text-gray-400 mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Your cart is empty
      </h2>
      <p className="text-gray-600 mb-6">
        Add items to your cart to get started
      </p>
      <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition">
        Continue Shopping
      </button>
    </div>
  );
}
