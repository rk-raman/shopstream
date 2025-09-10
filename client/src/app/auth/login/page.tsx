import React from "react";
import AuthLayout from "@/features/auth/layouts/AuthLayout";
import CustomerLoginForm from "@/features/auth/components/CustomerLoginForm";

export default function CustomerLoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your customer account"
    >
      <CustomerLoginForm />
    </AuthLayout>
  );
}
