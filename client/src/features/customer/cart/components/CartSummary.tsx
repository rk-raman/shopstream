interface CartSummaryProps {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  itemCount: number;
}

export default function CartSummary({
  subtotal,
  tax,
  shipping,
  total,
  itemCount,
}: CartSummaryProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 space-y-4 sticky top-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

      <div className="space-y-3">
        <div className="flex justify-between text-gray-700">
          <span>Subtotal ({itemCount} items)</span>
          <span className="font-semibold">${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-gray-700">
          <span>Shipping</span>
          <span className="font-semibold">
            {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
          </span>
        </div>

        <div className="flex justify-between text-gray-700">
          <span>Tax</span>
          <span className="font-semibold">${tax.toFixed(2)}</span>
        </div>

        <div className="border-t border-gray-300 pt-3">
          <div className="flex justify-between text-lg">
            <span className="font-bold text-gray-900">Total</span>
            <span className="font-bold text-blue-600">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition mt-6">
        Proceed to Checkout
      </button>

      <button className="w-full border border-gray-300 hover:bg-gray-100 text-gray-900 font-semibold py-2 rounded-lg transition">
        Continue Shopping
      </button>

      <div className="pt-4 border-t border-gray-300">
        <p className="text-xs text-gray-600 text-center">
          ✓ Free shipping on orders over $50
        </p>
      </div>
    </div>
  );
}
