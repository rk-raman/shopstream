import Image from "next/image";
import { type OrderItem } from "@/data/checkoutData";

interface OrderSummaryProps {
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export default function OrderSummary({
  items,
  subtotal,
  shipping,
  tax,
  total,
}: OrderSummaryProps) {
  return (
    <div className="bg-white rounded-lg p-6 sticky top-4">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>

      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex gap-3 pb-3 border-b border-gray-200"
          >
            <Image
              src={item.image}
              alt={item.name}
              width={60}
              height={60}
              className="w-14 h-14 object-cover rounded"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">{item.name}</p>
              <p className="text-xs text-gray-600">
                Qty: {item.quantity} × ${item.price.toFixed(2)}
              </p>
            </div>
            <span className="font-semibold text-gray-900">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span>${shipping.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>

        <div className="border-t border-gray-300 pt-3 flex justify-between text-lg">
          <span className="font-bold text-gray-900">Total</span>
          <span className="font-bold text-blue-600">${total.toFixed(2)}</span>
        </div>
      </div>

      <button className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition">
        Place Order
      </button>

      <p className="text-xs text-gray-600 text-center mt-3">
        By placing an order, you agree to our terms and conditions
      </p>
    </div>
  );
}
