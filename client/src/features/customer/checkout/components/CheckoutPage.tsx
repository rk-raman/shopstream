"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import CheckoutProgress from "./CheckoutProgress";
import ShippingForm from "./ShippingForm";
import BillingForm from "./BillingForm";
import ShippingMethod from "./ShippingMethod";
import PaymentForm from "./PaymentForm";
import OrderSummary from "./OrderSummary";
import { type CheckoutFormData, checkoutItems } from "../types";

const initialFormData: CheckoutFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
  billingSameAsShipping: true,
  shippingMethod: "standard",
  cardholderName: "",
  cardNumber: "",
  expiryDate: "",
  cvv: "",
  cardType: "credit",
};

export default function CheckoutPage() {
  const [formData, setFormData] = useState<CheckoutFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const shippingCosts: Record<string, number> = {
    standard: 9.99,
    express: 24.99,
    overnight: 49.99,
  };

  const subtotal = checkoutItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = shippingCosts[formData.shippingMethod];
  const tax = (subtotal + shipping) * 0.08;
  const total = subtotal + shipping + tax;

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePlaceOrder = () => {
    setOrderPlaced(true);
    setTimeout(() => {
      alert("Order placed successfully!");
      setFormData(initialFormData);
      setCurrentStep(1);
      setOrderPlaced(false);
    }, 2000);
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <div className="text-6xl mb-4">✓</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase. Your order has been placed
            successfully.
          </p>
          <div className="space-y-2 text-left bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm">
              <span className="font-semibold">Order #:</span> ORD-
              {Math.random().toString(36).substr(2, 9).toUpperCase()}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Email:</span> {formData.email}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Total:</span> ${total.toFixed(2)}
            </p>
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Content */}
      <div>
        <CheckoutProgress currentStep={currentStep} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <ShippingForm data={formData} onChange={setFormData} />
            )}

            {currentStep === 2 && (
              <>
                <BillingForm data={formData} onChange={setFormData} />
                <ShippingMethod data={formData} onChange={setFormData} />
              </>
            )}

            {currentStep === 3 && (
              <PaymentForm data={formData} onChange={setFormData} />
            )}

            {currentStep === 4 && (
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Review Your Order
                </h2>

                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h3 className="font-bold text-gray-900 mb-2">
                      Shipping Address
                    </h3>
                    <p className="text-gray-600">
                      {formData.firstName} {formData.lastName}
                    </p>
                    <p className="text-gray-600">{formData.address}</p>
                    <p className="text-gray-600">
                      {formData.city}, {formData.state} {formData.zipCode}
                    </p>
                  </div>

                  <div className="border-b pb-4">
                    <h3 className="font-bold text-gray-900 mb-2">
                      Shipping Method
                    </h3>
                    <p className="text-gray-600 capitalize">
                      {formData.shippingMethod} ($
                      {shippingCosts[formData.shippingMethod].toFixed(2)})
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">
                      Payment Method
                    </h3>
                    <p className="text-gray-600">
                      {formData.cardType === "credit"
                        ? "Credit Card"
                        : "Debit Card"}{" "}
                      ending in {formData.cardNumber.slice(-4)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className={`flex-1 py-3 rounded-lg font-bold transition ${
                  currentStep === 1
                    ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                }`}
              >
                Back
              </button>

              <button
                onClick={currentStep === 4 ? handlePlaceOrder : handleNext}
                className={`flex-1 py-3 rounded-lg font-bold text-white transition ${
                  currentStep === 4
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {currentStep === 4 ? "Place Order" : "Next"}
              </button>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <OrderSummary
              items={checkoutItems}
              subtotal={subtotal}
              shipping={shipping}
              tax={tax}
              total={total}
            />
          </div>
        </div>
      </div>
    </>
  );
}
