"use client";

import { useState } from "react";
import { useCheckout } from "../../context/CheckoutContext";
import type { PaymentMethodType } from "../../types";
import {
  Smartphone,
  CreditCard,
  Wallet,
  Banknote,
  Building2,
  IndianRupee,
} from "lucide-react";

const PAYMENT_OPTIONS: {
  id: PaymentMethodType;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "upi",
    label: "UPI",
    description: "Pay using any UPI app",
    icon: <Smartphone className="w-5 h-5" />,
  },
  {
    id: "card",
    label: "Credit / Debit Card",
    description: "Visa, MasterCard, RuPay",
    icon: <CreditCard className="w-5 h-5" />,
  },
  {
    id: "netbanking",
    label: "Net Banking",
    description: "All Indian banks supported",
    icon: <Building2 className="w-5 h-5" />,
  },
  {
    id: "wallet",
    label: "Wallets",
    description: "Paytm, PhonePe, Amazon Pay",
    icon: <Wallet className="w-5 h-5" />,
  },
  {
    id: "cod",
    label: "Cash on Delivery",
    description: "Pay when you receive the order",
    icon: <Banknote className="w-5 h-5" />,
  },
  {
    id: "emi",
    label: "EMI",
    description: "Easy monthly installments",
    icon: <IndianRupee className="w-5 h-5" />,
  },
];

export default function PaymentStep() {
  const { session, placeOrder, selectPaymentMethod, isLoading } = useCheckout();
  const [selected, setSelected] = useState<PaymentMethodType | null>(
    (session?.selectedPaymentMethod as PaymentMethodType) || null
  );
  const [upiId, setUpiId] = useState("");

  if (!session) return null;

  const handleSelect = (method: PaymentMethodType) => {
    setSelected(method);
  };

  const handlePlaceOrder = async () => {
    if (!selected) return;

    // First set the payment method
    await selectPaymentMethod(selected);

    // Then place the order
    if (selected === "cod") {
      await placeOrder({ method: "cod" });
    } else if (selected === "upi") {
      await placeOrder({ method: "upi", upiId });
    } else {
      // For other payment methods, place with a placeholder transactionId
      // In production, this would integrate with Stripe/Razorpay
      await placeOrder({
        method: selected,
        transactionId: `txn_${Date.now()}`,
      });
    }
  };

  return (
    <div className="space-y-1">
      {PAYMENT_OPTIONS.map((option) => (
        <div key={option.id}>
          <label
            className={`flex items-center gap-4 px-4 py-4 cursor-pointer border-b border-gray-100 transition-colors ${
              selected === option.id ? "bg-blue-50" : "hover:bg-gray-50"
            }`}
            onClick={() => handleSelect(option.id)}
          >
            <input
              type="radio"
              name="paymentMethod"
              checked={selected === option.id}
              onChange={() => handleSelect(option.id)}
              className="accent-[#2874f0]"
            />
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                selected === option.id
                  ? "bg-[#2874f0] text-white"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {option.icon}
            </div>
            <div className="flex-1">
              <span className="text-sm font-semibold text-gray-900">
                {option.label}
              </span>
              <p className="text-xs text-gray-500">{option.description}</p>
            </div>
          </label>

          {/* UPI ID input when UPI is selected */}
          {selected === "upi" && option.id === "upi" && (
            <div className="px-14 py-3 bg-blue-50 border-b border-gray-100">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Enter your UPI ID
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#2874f0]"
                />
                <button
                  onClick={handlePlaceOrder}
                  disabled={isLoading || !upiId.trim()}
                  className="px-6 py-2 bg-[#fb641b] text-white text-sm font-semibold rounded-sm hover:bg-[#e85d19] disabled:opacity-50"
                >
                  {isLoading ? "PAYING..." : "PAY ₹" + session.pricing.total.toLocaleString("en-IN")}
                </button>
              </div>
            </div>
          )}

          {/* Card form placeholder */}
          {selected === "card" && option.id === "card" && (
            <div className="px-14 py-3 bg-blue-50 border-b border-gray-100">
              <p className="text-xs text-gray-500 mb-3">
                You will be redirected to a secure payment gateway
              </p>
              <button
                onClick={handlePlaceOrder}
                disabled={isLoading}
                className="px-6 py-2 bg-[#fb641b] text-white text-sm font-semibold rounded-sm hover:bg-[#e85d19] disabled:opacity-50"
              >
                {isLoading ? "PROCESSING..." : "PAY ₹" + session.pricing.total.toLocaleString("en-IN")}
              </button>
            </div>
          )}

          {/* Net Banking */}
          {selected === "netbanking" && option.id === "netbanking" && (
            <div className="px-14 py-3 bg-blue-50 border-b border-gray-100">
              <p className="text-xs text-gray-500 mb-3">
                You will be redirected to your bank&apos;s website
              </p>
              <button
                onClick={handlePlaceOrder}
                disabled={isLoading}
                className="px-6 py-2 bg-[#fb641b] text-white text-sm font-semibold rounded-sm hover:bg-[#e85d19] disabled:opacity-50"
              >
                {isLoading ? "PROCESSING..." : "PAY ₹" + session.pricing.total.toLocaleString("en-IN")}
              </button>
            </div>
          )}

          {/* Wallet */}
          {selected === "wallet" && option.id === "wallet" && (
            <div className="px-14 py-3 bg-blue-50 border-b border-gray-100">
              <p className="text-xs text-gray-500 mb-3">
                Select your wallet provider
              </p>
              <button
                onClick={handlePlaceOrder}
                disabled={isLoading}
                className="px-6 py-2 bg-[#fb641b] text-white text-sm font-semibold rounded-sm hover:bg-[#e85d19] disabled:opacity-50"
              >
                {isLoading ? "PROCESSING..." : "PAY ₹" + session.pricing.total.toLocaleString("en-IN")}
              </button>
            </div>
          )}

          {/* COD */}
          {selected === "cod" && option.id === "cod" && (
            <div className="px-14 py-3 bg-blue-50 border-b border-gray-100">
              <p className="text-xs text-gray-500 mb-3">
                Pay ₹{session.pricing.total.toLocaleString("en-IN")} when the order is delivered
              </p>
              <button
                onClick={handlePlaceOrder}
                disabled={isLoading}
                className="px-6 py-2 bg-[#fb641b] text-white text-sm font-semibold rounded-sm hover:bg-[#e85d19] disabled:opacity-50"
              >
                {isLoading ? "PLACING ORDER..." : "CONFIRM ORDER"}
              </button>
            </div>
          )}

          {/* EMI */}
          {selected === "emi" && option.id === "emi" && (
            <div className="px-14 py-3 bg-blue-50 border-b border-gray-100">
              <p className="text-xs text-gray-500 mb-3">
                EMI available on credit cards above ₹3,000
              </p>
              <button
                onClick={handlePlaceOrder}
                disabled={isLoading}
                className="px-6 py-2 bg-[#fb641b] text-white text-sm font-semibold rounded-sm hover:bg-[#e85d19] disabled:opacity-50"
              >
                {isLoading ? "PROCESSING..." : "PAY ₹" + session.pricing.total.toLocaleString("en-IN")}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
