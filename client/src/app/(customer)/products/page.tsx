import React from "react";
import { Metadata } from "next";
import CustomerHeader from "@/components/layout/Header/CustomerHeader/CustomerHeader";
import CustomerFooter from "@/components/layout/Footer/CustomerFooter/CustomerFooter";
import ProductListingContainer from "@/features/customer/products/components/ProductList/ProductListingContainer";

export const metadata: Metadata = {
  title: "Checkout - ShopStream",
  description: "checkout page",
};
export default function Products() {
  return (
    <div className="min-h-screen flex flex-col">
      <CustomerHeader />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductListingContainer />
      </main>
      <CustomerFooter />
    </div>
  );
}
