"use client";

import React from "react";
import SellerHeader from "@/components/layout/Header/SellerHeader/SellerHeader";
import SellerSidebar from "@/components/layout/Sidebar/SellerSidebar";

interface SellerLayoutProps {
  children: React.ReactNode;
}

export default function SellerLayout({ children }: SellerLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <SellerHeader />

      {/* Main content area with sidebar */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:top-16 bg-background border-r">
          <SellerSidebar />
        </aside>

        {/* Main content */}
        <main className="flex-1 md:ml-64">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
