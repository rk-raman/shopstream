// client/src/features/customer/account/components/AccountLayout.tsx
"use client";

import React from "react";
import AccountSidebar from "./AccountSidebar";
import MobileAccountNav from "./MobileAccountNav";

interface AccountLayoutProps {
  children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Navigation */}
      <MobileAccountNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
    </div>
  );
}
