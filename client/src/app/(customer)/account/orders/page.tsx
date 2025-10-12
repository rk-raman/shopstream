// client/src/app/(customer)/account/orders/page.tsx
"use client";

import React, { useState } from "react";
import OrderCard from "@/features/customer/account/orders/components/OrderCard";
import OrderSearchFilter from "@/features/customer/account/orders/components/OrderSearchFilter";
import OrderEmptyState from "@/features/customer/account/orders/components/OrderEmptyState";
import type { Order } from "@/features/customer/account/orders/types";

// Mock data - Replace with API call
const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-2024-001234",
    date: "2024-10-01",
    status: "delivered",
    deliveryDate: "2024-10-05",
    total: 2499,
    subtotal: 2499,
    shipping: 0,
    tax: 0,
    paymentMethod: "UPI",
    items: [
      {
        id: "1",
        productId: "p1",
        name: "Premium Wireless Headphones",
        image:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop",
        quantity: 1,
        price: 2499,
        color: "Black",
      },
    ],
    shippingAddress: {
      name: "John Doe",
      phone: "9876543210",
      address: "123, Main Street, Anna Nagar",
      locality: "T Nagar",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600001",
    },
  },
  {
    id: "2",
    orderNumber: "ORD-2024-001235",
    date: "2024-10-05",
    status: "shipped",
    total: 1299,
    subtotal: 1299,
    shipping: 0,
    tax: 0,
    paymentMethod: "Credit Card",
    items: [
      {
        id: "2",
        productId: "p2",
        name: "Smart Fitness Band",
        image:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop",
        quantity: 1,
        price: 1299,
      },
    ],
    shippingAddress: {
      name: "John Doe",
      phone: "9876543210",
      address: "123, Main Street, Anna Nagar",
      locality: "T Nagar",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600001",
    },
  },
  {
    id: "3",
    orderNumber: "ORD-2024-001236",
    date: "2024-10-08",
    status: "processing",
    total: 3999,
    subtotal: 3999,
    shipping: 0,
    tax: 0,
    paymentMethod: "COD",
    items: [
      {
        id: "3",
        productId: "p3",
        name: "Laptop Backpack with USB Port",
        image:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop",
        quantity: 2,
        price: 1999.5,
      },
    ],
    shippingAddress: {
      name: "John Doe",
      phone: "9876543210",
      address: "456, Office Tower, IT Park",
      locality: "Velachery",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600002",
    },
  },
];

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [orders] = useState<Order[]>(mockOrders);

  // Filter orders based on search and status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesFilter =
      selectedFilter === "all" || order.status === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">My Orders</h2>

        {/* Search and Filter */}
        <OrderSearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />
      </div>

      {/* Orders List */}
      <div className="p-6">
        {filteredOrders.length === 0 ? (
          <OrderEmptyState
            message={
              searchTerm ? "No orders match your search" : "No orders found"
            }
            showButton={!searchTerm}
          />
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
