import { type CheckoutFormData } from "@/data/checkoutData";

interface BillingFormProps {
  data: CheckoutFormData;
  onChange: (data: CheckoutFormData) => void;
}

export default function BillingForm({ data, onChange }: BillingFormProps) {
  const handleChange = (field: keyof CheckoutFormData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-white rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Billing Address</h2>

      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.billingSameAsShipping}
            onChange={(e) =>
              handleChange("billingSameAsShipping", e.target.checked)
            }
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-700 font-semibold">
            Same as shipping address
          </span>
        </label>
      </div>

      {!data.billingSameAsShipping && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Address *
            </label>
            <input
              type="text"
              value={data.billingAddress || ""}
              onChange={(e) => handleChange("billingAddress", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="123 Billing Street"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                value={data.billingCity || ""}
                onChange={(e) => handleChange("billingCity", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="New York"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                State *
              </label>
              <input
                type="text"
                value={data.billingState || ""}
                onChange={(e) => handleChange("billingState", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="NY"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Zip Code *
              </label>
              <input
                type="text"
                value={data.billingZipCode || ""}
                onChange={(e) => handleChange("billingZipCode", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="10001"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
