import React from "react";
import { Metadata } from "next";
import CustomerHeader from "@/components/layout/Header/CustomerHeader/CustomerHeader";
import CustomerFooter from "@/components/layout/Footer/CustomerFooter/CustomerFooter";
import CheckoutPage from "@/features/customer/checkout/components/CheckoutPage";

export const metadata: Metadata = {
  title: "Checkout - ShopStream",
  description: "checkout page",
};
export default function Cart() {
  return (
    <div className="min-h-screen flex flex-col">
      <CustomerHeader />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CheckoutPage />
      </main>
      <CustomerFooter />
    </div>
  );
}
