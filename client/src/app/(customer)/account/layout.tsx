// client/src/app/(customer)/account/layout.tsx
import React from "react";
import CustomerHeader from "@/components/layout/Header/CustomerHeader/CustomerHeader";
import CustomerFooter from "@/components/layout/Footer/CustomerFooter/CustomerFooter";
import ProtectedRoute from "@/features/auth/components/ProtectedRoute";
import AccountSidebar from "@/features/customer/account/components/AccountSidebar";
import MobileAccountNav from "@/features/customer/account/components/MobileAccountNav";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="customer" redirectTo="/login">
      <div className="min-h-screen flex flex-col bg-gray-50">
        <CustomerHeader />
        {/* Mobile Navigation */}
        <MobileAccountNav />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - Hidden on mobile, shown on desktop */}
            <aside className="hidden lg:block lg:col-span-1">
              <div className="sticky top-6">
                <AccountSidebar />
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-3">{children}</main>
          </div>
        </div>
        <CustomerFooter />
      </div>
    </ProtectedRoute>
  );
}
