"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Home,
  Plus,
  FolderOpen,
  FolderTree,
  Building,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Products",
    href: "/dashboard/products",
    icon: Package,
    children: [
      { name: "All Products", href: "/dashboard/products" },
      { name: "Add Product", href: "/dashboard/products/add" },
    ],
  },
  {
    name: "Categories",
    href: "/dashboard/categories",
    icon: FolderTree,
  },
  {
    name: "Brands",
    href: "/dashboard/brands",
    icon: Building,
  },
  {
    name: "Collections",
    href: "/dashboard/collections",
    icon: FolderOpen,
    children: [
      { name: "All Collections", href: "/dashboard/collections" },
      { name: "Create Collection", href: "/dashboard/collections/create" },
    ],
  },
  {
    name: "Orders",
    href: "/dashboard/orders",
    icon: ShoppingCart,
    children: [
      { name: "All Orders", href: "/dashboard/orders" },
      { name: "Pending Orders", href: "/dashboard/orders?status=pending" },
    ],
  },
  {
    name: "Customers",
    href: "/dashboard/customers",
    icon: Users,
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function SellerSidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className={cn("pb-12 min-h-screen", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <ScrollArea className="h-[calc(100vh-8rem)] px-1">
              <div className="space-y-2 p-2">
                {navigation.map((item) => (
                  <div key={item.name}>
                    <Link href={item.href}>
                      <Button
                        variant={isActive(item.href) ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start h-10",
                          isActive(item.href) &&
                            "bg-secondary text-secondary-foreground"
                        )}
                      >
                        <item.icon className="mr-3 h-4 w-4" />
                        {item.name}
                      </Button>
                    </Link>

                    {/* Sub-navigation for items with children */}
                    {item.children && isActive(item.href) && (
                      <div className="ml-6 mt-2 space-y-1">
                        {item.children.map((child) => (
                          <Link key={child.href} href={child.href}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "w-full justify-start h-8 text-sm font-normal",
                                pathname === child.href && "bg-secondary/50"
                              )}
                            >
                              {child.name}
                            </Button>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-3 py-2">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground px-2">
              Quick Actions
            </h4>
            <Link href="/dashboard/products/add">
              <Button className="w-full justify-start" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </Link>
            <Link href="/dashboard/collections/create">
              <Button
                className="w-full justify-start"
                size="sm"
                variant="outline"
              >
                <FolderOpen className="mr-2 h-4 w-4" />
                Create Collection
              </Button>
            </Link>
            <Link href="/dashboard/categories">
              <Button
                className="w-full justify-start"
                size="sm"
                variant="outline"
              >
                <FolderTree className="mr-2 h-4 w-4" />
                Manage Categories
              </Button>
            </Link>
            <Link href="/dashboard/brands">
              <Button
                className="w-full justify-start"
                size="sm"
                variant="outline"
              >
                <Building className="mr-2 h-4 w-4" />
                Manage Brands
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
