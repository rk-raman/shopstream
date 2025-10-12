// client/src/features/customer/account/components/MobileAccountNav.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Package, MapPin, Heart, Power, Menu, X } from "lucide-react";

interface MenuItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export default function MobileAccountNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    {
      href: "/account",
      label: "Profile Information",
      icon: <User className="w-5 h-5" />,
    },
    {
      href: "/account/orders",
      label: "My Orders",
      icon: <Package className="w-5 h-5" />,
    },
    {
      href: "/account/addresses",
      label: "Manage Addresses",
      icon: <MapPin className="w-5 h-5" />,
    },
    {
      href: "/account/wishlist",
      label: "My Wishlist",
      icon: <Heart className="w-5 h-5" />,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/account") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  const currentPage = menuItems.find((item) => isActive(item.href));

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-between w-full"
        >
          <div className="flex items-center space-x-3">
            {currentPage?.icon}
            <span className="font-medium text-gray-900">
              {currentPage?.label}
            </span>
          </div>
          <Menu className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />

          {/* Sidebar */}
          <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl transform transition-transform">
            {/* Header */}
            <div className="bg-blue-600 text-white p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm opacity-90">Hello,</p>
                    <p className="font-semibold text-lg">John Doe</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-blue-700 p-2 rounded"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Menu Items */}
            <nav className="py-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-6 py-4 transition-colors ${
                    isActive(item.href)
                      ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                      : "text-gray-700"
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}

              {/* Logout */}
              <button
                className="w-full flex items-center space-x-3 px-6 py-4 text-gray-700"
                onClick={() => {
                  // Add logout logic here
                  console.log("Logout clicked");
                  setIsOpen(false);
                }}
              >
                <Power className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
