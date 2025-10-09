import { type CheckoutFormData } from "@/data/checkoutData";

interface ShippingMethodProps {
  data: CheckoutFormData;
  onChange: (data: CheckoutFormData) => void;
}

const methods = [
  {
    id: "standard" as const,
    name: "Standard Shipping",
    price: 9.99,
    days: "5-7 business days",
    icon: "📦",
  },
  {
    id: "express" as const,
    name: "Express Shipping",
    price: 24.99,
    days: "2-3 business days",
    icon: "🚀",
  },
  {
    id: "overnight" as const,
    name: "Overnight Shipping",
    price: 49.99,
    days: "Next business day",
    icon: "⚡",
  },
];

export default function ShippingMethod({
  data,
  onChange,
}: ShippingMethodProps) {
  return (
    <div className="bg-white rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping Method</h2>

      <div className="space-y-3">
        {methods.map((method) => (
          <label
            key={method.id}
            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
              data.shippingMethod === method.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="shipping"
              value={method.id}
              checked={data.shippingMethod === method.id}
              onChange={(e) =>
                onChange({
                  ...data,
                  shippingMethod: e.target.value as
                    | "standard"
                    | "express"
                    | "overnight",
                })
              }
              className="w-4 h-4 text-blue-600"
            />

            <div className="flex-1 ml-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{method.icon}</span>
                <h3 className="font-semibold text-gray-900">{method.name}</h3>
              </div>
              <p className="text-sm text-gray-600">{method.days}</p>
            </div>

            <span className="font-bold text-gray-900">
              ${method.price.toFixed(2)}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
