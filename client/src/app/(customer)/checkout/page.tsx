import React from "react";
import { Metadata } from "next";
import CustomerHeader from "@/components/layout/Header/CustomerHeader/CustomerHeader";
import CustomerFooter from "@/components/layout/Footer/CustomerFooter/CustomerFooter";
import CheckoutPage from "@/features/customer/checkout/components/CheckoutPage";

export const metadata: Metadata = {
  title: "Checkout - ShopStream",
  description: "Complete your purchase",
};
export default function Checkout() {
  return (
    <div className="min-h-screen flex flex-col">
      <CustomerHeader />
      <main className="flex-1">
        <CheckoutPage />
      </main>
      <CustomerFooter />
    </div>
  );
}
