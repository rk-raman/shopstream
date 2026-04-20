// client/src/components/layout/Header/CustomerHeader/CustomerHeader.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Package,
  MapPin,
  Settings,
  Bell,
} from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";

interface CustomerHeaderProps {
  children?: React.ReactNode;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  subcategories?: { id: string; name: string; slug: string }[];
}

const navigationCategories: Category[] = [
  {
    id: "1",
    name: "Electronics",
    slug: "electronics",
    subcategories: [
      { id: "1-1", name: "Smartphones", slug: "smartphones" },
      { id: "1-2", name: "Laptops", slug: "laptops" },
      { id: "1-3", name: "Headphones", slug: "headphones" },
      { id: "1-4", name: "Cameras", slug: "cameras" },
    ],
  },
  {
    id: "2",
    name: "Fashion",
    slug: "fashion",
    subcategories: [
      { id: "2-1", name: "Men's Clothing", slug: "mens-clothing" },
      { id: "2-2", name: "Women's Clothing", slug: "womens-clothing" },
      { id: "2-3", name: "Shoes", slug: "shoes" },
      { id: "2-4", name: "Accessories", slug: "accessories" },
    ],
  },
  {
    id: "3",
    name: "Home & Living",
    slug: "home-living",
    subcategories: [
      { id: "3-1", name: "Furniture", slug: "furniture" },
      { id: "3-2", name: "Decor", slug: "decor" },
      { id: "3-3", name: "Kitchen", slug: "kitchen" },
      { id: "3-4", name: "Bedding", slug: "bedding" },
    ],
  },
  {
    id: "4",
    name: "Sports & Fitness",
    slug: "sports-fitness",
  },
  {
    id: "5",
    name: "Books & Media",
    slug: "books-media",
  },
  {
    id: "6",
    name: "Beauty & Health",
    slug: "beauty-health",
  },
];

export default function CustomerHeader({ children }: CustomerHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(3);

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
      if (
        categoryMenuRef.current &&
        !categoryMenuRef.current.contains(event.target as Node)
      ) {
        setActiveCategory(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop/products?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchFocused(false);
      setSearchQuery("");
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    router.push("/");
  };

  // Mock search suggestions
  const searchSuggestions =
    searchQuery.length > 2
      ? [
          "Wireless Headphones",
          "Smart Watch",
          "Laptop Stand",
          "Gaming Mouse",
        ].filter((item) =>
          item.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [];

  return (
    <>
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        {/* Top Bar */}
        <div className="bg-gradient-to-r from-primary via-blue-600 to-indigo-600 text-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between py-2 text-sm">
              <div className="flex items-center gap-4">
                <span className="hidden sm:inline">
                  📦 Free shipping on orders over $50
                </span>
                <span className="sm:hidden">Free shipping $50+</span>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href="/about"
                  className="hover:underline hidden md:inline"
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="hover:underline hidden md:inline"
                >
                  Contact
                </Link>
                <Link href="/help" className="hover:underline">
                  Help
                </Link>
                {!user && (
                  <Link
                    href="/seller/signup"
                    className="hover:underline font-medium"
                  >
                    Become a Seller
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4 py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                ShopStream
              </div>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-2xl" ref={searchRef}>
              <form onSubmit={handleSearch} className="relative w-full">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    placeholder="Search for products, brands, and more..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Search Suggestions Dropdown */}
                {isSearchFocused && searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                    <div className="p-2">
                      <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                        Suggestions
                      </p>
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSearchQuery(suggestion);
                            setIsSearchFocused(false);
                            router.push(
                              `/shop/products?search=${encodeURIComponent(
                                suggestion
                              )}`
                            );
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded transition-colors flex items-center gap-2"
                        >
                          <Search className="w-4 h-4 text-gray-400" />
                          <span>{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Notifications - Desktop */}
              {user && (
                <Link
                  href="/account/notifications"
                  className="hidden md:flex relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-6 h-6 text-gray-700" />
                  {notificationCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                      {notificationCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Shopping Cart"
              >
                <ShoppingCart className="w-6 h-6 text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {user ? (
                <div className="hidden md:block relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-600 transition-transform ${
                        showUserMenu ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* User Dropdown */}
                  {showUserMenu && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-white border rounded-lg shadow-xl z-50">
                      <div className="p-4 border-b">
                        <p className="font-semibold text-gray-900">
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <div className="py-2">
                        <Link
                          href="/account"
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                        >
                          <User className="w-4 h-4 text-gray-600" />
                          <span>My Account</span>
                        </Link>
                        <Link
                          href="/account/orders"
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                        >
                          <Package className="w-4 h-4 text-gray-600" />
                          <span>Orders</span>
                        </Link>
                        <Link
                          href="/account/addresses"
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                        >
                          <MapPin className="w-4 h-4 text-gray-600" />
                          <span>Addresses</span>
                        </Link>
                        <Link
                          href="/account/settings"
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                        >
                          <Settings className="w-4 h-4 text-gray-600" />
                          <span>Settings</span>
                        </Link>
                      </div>
                      <div className="border-t py-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors w-full text-left text-red-600"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  <User className="w-4 h-4" />
                  <span>Login</span>
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="lg:hidden pb-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              />
            </form>
          </div>
        </div>

        {/* Categories Navigation - Desktop */}
        <div className="hidden lg:block border-t bg-gray-50">
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-1" ref={categoryMenuRef}>
              {navigationCategories.map((category) => (
                <div
                  key={category.id}
                  className="relative"
                  onMouseEnter={() => setActiveCategory(category.id)}
                  onMouseLeave={() => setActiveCategory(null)}
                >
                  <Link
                    href={`/shop/categories/${category.slug}`}
                    className={`flex items-center gap-1 px-4 py-3 font-medium transition-colors ${
                      activeCategory === category.id
                        ? "text-primary bg-white"
                        : "text-gray-700 hover:text-primary hover:bg-white"
                    }`}
                  >
                    {category.name}
                    {category.subcategories && (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Link>

                  {/* Subcategories Dropdown */}
                  {category.subcategories && activeCategory === category.id && (
                    <div className="absolute top-full left-0 mt-0 bg-white border rounded-lg shadow-lg min-w-[220px] z-50">
                      <div className="py-2">
                        {category.subcategories.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/shop/categories/${category.slug}/${sub.slug}`}
                            className="block px-4 py-2 hover:bg-gray-50 text-gray-700 hover:text-primary transition-colors"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <Link
                href="/shop/products?filter=new"
                className="px-4 py-3 font-medium text-gray-700 hover:text-primary hover:bg-white transition-colors"
              >
                New Arrivals
              </Link>
              <Link
                href="/shop/products?filter=deals"
                className="px-4 py-3 font-medium text-red-600 hover:text-red-700 hover:bg-white transition-colors"
              >
                🔥 Deals
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-80 bg-white z-50 transform transition-transform duration-300 lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full overflow-y-auto">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <span className="text-lg font-bold text-primary">Menu</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* User Section */}
          {user ? (
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Link
                  href="/account/orders"
                  className="flex flex-col items-center gap-1 p-2 bg-white rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Package className="w-5 h-5 text-primary" />
                  <span className="text-xs">Orders</span>
                </Link>
                <Link
                  href="/cart"
                  className="flex flex-col items-center gap-1 p-2 bg-white rounded-lg relative"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  <span className="text-xs">Cart</span>
                  {cartCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-4 border-b bg-gray-50">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white rounded-lg font-semibold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="w-5 h-5" />
                Login / Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Categories */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
            <div className="space-y-1">
              {navigationCategories.map((category) => (
                <div key={category.id}>
                  <Link
                    href={`/shop/categories/${category.slug}`}
                    className="block px-3 py-2 rounded-lg hover:bg-gray-100 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                  {category.subcategories && (
                    <div className="ml-4 mt-1 space-y-1">
                      {category.subcategories.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/shop/categories/${category.slug}/${sub.slug}`}
                          className="block px-3 py-1 text-sm text-gray-600 hover:text-primary"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="p-4 border-t">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Links</h3>
            <div className="space-y-1">
              <Link
                href="/shop/products?filter=new"
                className="block px-3 py-2 rounded-lg hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                New Arrivals
              </Link>
              <Link
                href="/shop/products?filter=deals"
                className="block px-3 py-2 rounded-lg hover:bg-gray-100 text-red-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                🔥 Deals
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 rounded-lg hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="block px-3 py-2 rounded-lg hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                href="/help"
                className="block px-3 py-2 rounded-lg hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Help Center
              </Link>
            </div>
          </div>

          {/* Logout Button */}
          {user && (
            <div className="p-4 border-t">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Custom children content */}
      {children}
    </>
  );
}
