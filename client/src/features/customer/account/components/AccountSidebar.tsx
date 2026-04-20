"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Package, MapPin, Heart, Power } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import wishlistService from "@/features/customer/account/wishlist/services/wishlistService";

interface MenuItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export default function AccountSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [wishlistCount, setWishlistCount] = useState(0);

  const fetchCount = () => {
    wishlistService
      .getWishlist()
      .then((res) => {
        if (res.success && res.data?.wishlist) {
          setWishlistCount(
            res.data.wishlist.filter((p: any) => p != null).length
          );
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (user) fetchCount();
  }, [user]);

  // Listen for wishlist changes from other components
  useEffect(() => {
    const handler = () => fetchCount();
    window.addEventListener("wishlist-updated", handler);
    return () => window.removeEventListener("wishlist-updated", handler);
  }, []);

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
      badge: wishlistCount,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/account") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      {/* User Info Header */}
      <div className="bg-blue-600 text-white p-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm opacity-90">Hello,</p>
            <p className="font-semibold text-lg">{user?.fullName}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="py-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-between px-6 py-4 transition-colors ${
              isActive(item.href)
                ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center space-x-3">
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </div>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                {item.badge}
              </span>
            )}
          </Link>
        ))}

        {/* Logout */}
        <button
          className="w-full flex items-center space-x-3 px-6 py-4 text-gray-700 hover:bg-gray-50 transition-colors"
          onClick={() => {
            if (logout) logout();
          }}
        >
          <Power className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </nav>
    </div>
  );
}
