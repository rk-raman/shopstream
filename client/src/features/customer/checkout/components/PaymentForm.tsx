import { type CheckoutFormData } from "@/data/checkoutData";
import { CreditCard } from "lucide-react";

interface PaymentFormProps {
  data: CheckoutFormData;
  onChange: (data: CheckoutFormData) => void;
}

export default function PaymentForm({ data, onChange }: PaymentFormProps) {
  const handleChange = (field: keyof CheckoutFormData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleCardNumberChange = (value: string) => {
    const formatted = value
      .replace(/\s/g, "")
      .replace(/(\d{4})/g, "$1 ")
      .trim();
    handleChange("cardNumber", formatted);
  };

  const handleExpiryChange = (value: string) => {
    const formatted = value
      .replace(/\D/g, "")
      .slice(0, 4)
      .replace(/(\d{2})(\d{0,2})/, "$1/$2");
    handleChange("expiryDate", formatted);
  };

  return (
    <div className="bg-white rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Payment Information
      </h2>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Cardholder Name *
        </label>
        <input
          type="text"
          value={data.cardholderName}
          onChange={(e) => handleChange("cardholderName", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="John Doe"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Card Number *
        </label>
        <div className="relative">
          <CreditCard
            className="absolute left-3 top-3 text-gray-400"
            size={20}
          />
          <input
            type="text"
            value={data.cardNumber}
            onChange={(e) => handleCardNumberChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="1234 5678 9012 3456"
            maxLength={19}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Expiry Date *
          </label>
          <input
            type="text"
            value={data.expiryDate}
            onChange={(e) => handleExpiryChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="MM/YY"
            maxLength={5}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            CVV *
          </label>
          <input
            type="text"
            value={data.cvv}
            onChange={(e) =>
              handleChange("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="123"
            maxLength={4}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Card Type
        </label>
        <select
          value={data.cardType}
          onChange={(e) =>
            handleChange("cardType", e.target.value as "credit" | "debit")
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="credit">Credit Card</option>
          <option value="debit">Debit Card</option>
        </select>
      </div>
    </div>
  );
}
