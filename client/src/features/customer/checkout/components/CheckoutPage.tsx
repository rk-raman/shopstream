"use client";

import { useEffect } from "react";
import { ShoppingBag, Loader2 } from "lucide-react";
import { CheckoutProvider, useCheckout } from "../context/CheckoutContext";
import CheckoutStep from "./CheckoutStep";
import LoginStep from "./steps/LoginStep";
import AddressStep from "./steps/AddressStep";
import OrderSummaryStep from "./steps/OrderSummaryStep";
import PaymentStep from "./steps/PaymentStep";
import PriceDetails from "./sidebar/PriceDetails";
import OrderConfirmation from "./confirmation/OrderConfirmation";
import type { CheckoutStep as CheckoutStepType } from "../types";

function CheckoutContent() {
  const {
    session,
    isLoading,
    error,
    orderPlaced,
    steps,
    activeStep,
    goToStep,
    initSession,
  } = useCheckout();

  useEffect(() => {
    initSession();
  }, [initSession]);

  // Loading state
  if (isLoading && !session) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#2874f0] mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            Setting up your checkout...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !session) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Unable to start checkout
          </h2>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <a
            href="/cart"
            className="inline-block px-6 py-2 bg-[#2874f0] text-white text-sm font-semibold rounded-sm hover:bg-[#1a65d6]"
          >
            Go to Cart
          </a>
        </div>
      </div>
    );
  }

  // Order placed - show confirmation
  if (orderPlaced) {
    return <OrderConfirmation />;
  }

  // Map step key to component
  const stepComponents: Record<CheckoutStepType, React.ReactNode> = {
    login: <LoginStep />,
    address: <AddressStep />,
    summary: <OrderSummaryStep />,
    payment: <PaymentStep />,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Left Column - Accordion Steps */}
      <div className="lg:col-span-2 space-y-3">
        {steps.map((stepState) => (
          <CheckoutStep
            key={stepState.step}
            stepState={stepState}
            onChangeClick={() => goToStep(stepState.step)}
          >
            {stepComponents[stepState.step]}
          </CheckoutStep>
        ))}
      </div>

      {/* Right Column - Price Details (sticky) */}
      <div className="lg:col-span-1">
        <PriceDetails />
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <CheckoutProvider>
      <div className="min-h-screen bg-[#f1f3f6] py-4">
        <div className="max-w-6xl mx-auto px-4">
          <CheckoutContent />
        </div>
      </div>
    </CheckoutProvider>
  );
}
