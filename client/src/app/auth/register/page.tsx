import React from "react";
import AuthLayout from "@/features/auth/layouts/AuthLayout";
import CustomerRegisterForm from "@/features/auth/components/CustomerRegisterForm";

export default function CustomerRegisterPage() {
  return (
    <AuthLayout
      title="Join ShopStream"
      subtitle="Create your customer account to start shopping"
    >
      <CustomerRegisterForm />
    </AuthLayout>
  );
}
