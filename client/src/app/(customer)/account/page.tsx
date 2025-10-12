import React from "react";
import { Metadata } from "next";
import CustomerHeader from "@/components/layout/Header/CustomerHeader/CustomerHeader";
import CustomerFooter from "@/components/layout/Footer/CustomerFooter/CustomerFooter";
import ProtectedRoute from "@/features/auth/components/ProtectedRoute";

export const metadata: Metadata = {
  title: "Account - ShopStream",
  description: "account page",
};

export default function Page() {
  return (
    <ProtectedRoute requiredRole="customer" redirectTo="/login">
      <div className="min-h-screen flex flex-col">
        <CustomerHeader />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          Comming soon
        </main>
        <CustomerFooter />
      </div>
    </ProtectedRoute>
  );
}
