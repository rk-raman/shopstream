import React from "react";
import AuthLayout from "@/features/auth/layouts/AuthLayout";
import SellerRegisterForm from "@/features/auth/components/SellerRegisterForm";

export default function SellerRegisterPage() {
  return (
    <AuthLayout
      title="Become a Seller"
      subtitle="Join ShopStream as a seller and grow your business"
    >
      <SellerRegisterForm />
    </AuthLayout>
  );
}
