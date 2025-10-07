// client/src/app/(customer)/page.tsx
import React from "react";
import { Metadata } from "next";
import CustomerHeader from "@/components/layout/Header/CustomerHeader/CustomerHeader";
import CustomerFooter from "@/components/layout/Footer/CustomerFooter/CustomerFooter";
import Homepage from "@/features/customer/homepage/components/Homepage";

export const metadata: Metadata = {
  title: "ShopStream - Your Trusted E-commerce Platform",
  description:
    "Discover amazing products and great deals on ShopStream. Shop electronics, fashion, home goods, and more.",
  keywords:
    "e-commerce, online shopping, deals, products, fashion, electronics",
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <CustomerHeader />
      <main className="flex-1">
        <Homepage />
      </main>
      <CustomerFooter />
    </div>
  );
}
