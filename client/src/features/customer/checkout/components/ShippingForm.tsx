import { type CheckoutFormData } from "@/data/checkoutData";

interface ShippingFormProps {
  data: CheckoutFormData;
  onChange: (data: CheckoutFormData) => void;
}

export default function ShippingForm({ data, onChange }: ShippingFormProps) {
  const handleChange = (field: keyof CheckoutFormData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-white rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping Address</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            First Name *
          </label>
          <input
            type="text"
            value={data.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="John"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            value={data.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Doe"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="john@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Phone *
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Address *
        </label>
        <input
          type="text"
          value={data.address}
          onChange={(e) => handleChange("address", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="123 Main Street"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            City *
          </label>
          <input
            type="text"
            value={data.city}
            onChange={(e) => handleChange("city", e.target.value)}
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
            value={data.state}
            onChange={(e) => handleChange("state", e.target.value)}
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
            value={data.zipCode}
            onChange={(e) => handleChange("zipCode", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="10001"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Country *
        </label>
        <select
          value={data.country}
          onChange={(e) => handleChange("country", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Country</option>
          <option value="US">United States</option>
          <option value="CA">Canada</option>
          <option value="UK">United Kingdom</option>
          <option value="AU">Australia</option>
        </select>
      </div>
    </div>
  );
}
