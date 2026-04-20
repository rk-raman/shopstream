"use client";

import React from "react";
import CustomerHeader from "@/components/layout/Header/CustomerHeader/CustomerHeader";
import CustomerFooter from "@/components/layout/Footer/CustomerFooter/CustomerFooter";
import ProductListingContainer from "@/features/customer/products/components/ProductList/ProductListingContainer";

export default function ProductsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <CustomerHeader />
      <main className="flex-1">
        <ProductListingContainer />
      </main>
      <CustomerFooter />
    </div>
  );
}
