import React from "react";
import AuthLayout from "@/features/auth/layouts/AuthLayout";
import SellerLoginForm from "@/features/auth/components/SellerLoginForm";

export default function SellerLoginPage() {
  return (
    <AuthLayout title="Seller Portal" subtitle="Sign in to your seller account">
      <SellerLoginForm />
    </AuthLayout>
  );
}
