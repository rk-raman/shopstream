import React from "react";
import { Metadata } from "next";
import SellerRegisterForm from "@/features/auth/components/SellerRegisterForm";

export const metadata: Metadata = {
  title: "Seller Registration - ShopStream",
  description: "Create your seller account and start selling",
};

export default function SellerSignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your seller account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <a
              href="/seller/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              sign in to your existing account
            </a>
          </p>
        </div>
        <SellerRegisterForm />
      </div>
    </div>
  );
}
