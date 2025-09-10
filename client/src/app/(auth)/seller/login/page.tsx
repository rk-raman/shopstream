import React from "react";
import { Metadata } from "next";
import SellerLoginForm from "@/features/auth/components/SellerLoginForm";

export const metadata: Metadata = {
  title: "Seller Login - ShopStream",
  description: "Login to your seller dashboard",
};

export default function SellerLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Seller Dashboard Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <a
              href="/seller/signup"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              create a seller account
            </a>
          </p>
        </div>
        <SellerLoginForm />
      </div>
    </div>
  );
}
