// client/src/app/(customer)/account/orders/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import OrderTracking from "@/features/customer/account/orders/components/OrderTracking";
import OrderItemsList from "@/features/customer/account/orders/components/OrderItemsList";
import OrderAddressDisplay from "@/features/customer/account/orders/components/OrderAddressDisplay";
import OrderStatusBadge from "@/features/customer/account/orders/components/OrderStatusBadge";
import { ArrowLeft, Download, HelpCircle } from "lucide-react";
import type {
  Order,
  TrackingStep,
} from "@/features/customer/account/orders/types";

// Mock data - Replace with API call
const mockOrderDetails: Record<
  string,
  Order & { trackingSteps: TrackingStep[] }
> = {
  "1": {
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
        image: "/api/placeholder/120/120",
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
    trackingSteps: [
      { label: "Order Placed", date: "Oct 1, 2024 10:30 AM", completed: true },
      {
        label: "Order Confirmed",
        date: "Oct 1, 2024 11:00 AM",
        completed: true,
      },
      { label: "Shipped", date: "Oct 3, 2024 9:00 AM", completed: true },
      {
        label: "Out for Delivery",
        date: "Oct 5, 2024 8:00 AM",
        completed: true,
      },
      { label: "Delivered", date: "Oct 5, 2024 2:30 PM", completed: true },
    ],
  },
  "2": {
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
        image: "/api/placeholder/120/120",
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
    trackingSteps: [
      { label: "Order Placed", date: "Oct 5, 2024 3:00 PM", completed: true },
      {
        label: "Order Confirmed",
        date: "Oct 5, 2024 3:30 PM",
        completed: true,
      },
      { label: "Shipped", date: "Oct 7, 2024 10:00 AM", completed: true },
      {
        label: "Out for Delivery",
        date: "Expected Oct 10, 2024",
        completed: false,
      },
      { label: "Delivered", date: "Expected Oct 10, 2024", completed: false },
    ],
  },
  "3": {
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
        image: "/api/placeholder/120/120",
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
    trackingSteps: [
      { label: "Order Placed", date: "Oct 8, 2024 11:00 AM", completed: true },
      {
        label: "Order Confirmed",
        date: "Oct 8, 2024 11:30 AM",
        completed: true,
      },
      { label: "Shipped", date: "Processing...", completed: false },
      { label: "Out for Delivery", date: "Pending", completed: false },
      { label: "Delivered", date: "Pending", completed: false },
    ],
  },
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<
    (Order & { trackingSteps: TrackingStep[] }) | null
  >(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchOrder = async () => {
      setLoading(true);
      // Replace with actual API call: const data = await fetch(`/api/orders/${orderId}`)
      const data = mockOrderDetails[orderId];
      setOrder(data || null);
      setLoading(false);
    };

    fetchOrder();
  }, [orderId]);

  const handleDownloadInvoice = () => {
    // Implement invoice download
    console.log("Downloading invoice for order:", order?.orderNumber);
    alert("Invoice download will be implemented with backend");
  };

  const handleNeedHelp = () => {
    // Navigate to support or open help modal
    console.log("Need help with order:", order?.orderNumber);
    alert("Support system will be implemented");
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-gray-500 text-lg mb-4">Order not found</p>
        <Link
          href="/account/orders"
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Orders</span>
        </Link>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/account/orders"
        className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Orders</span>
      </Link>

      {/* Order Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {order.orderNumber}
            </h1>
            <p className="text-gray-600">Placed on {formatDate(order.date)}</p>
            {order.deliveryDate && order.status === "delivered" && (
              <p className="text-sm text-green-600 mt-1">
                Delivered on {formatDate(order.deliveryDate)}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <OrderStatusBadge status={order.status} />
          </div>
        </div>
      </div>

      {/* Order Tracking */}
      <OrderTracking steps={order.trackingSteps} />

      {/* Order Items */}
      <OrderItemsList
        items={order.items}
        subtotal={order.subtotal}
        shipping={order.shipping}
        tax={order.tax}
        total={order.total}
      />

      {/* Shipping Address */}
      <OrderAddressDisplay address={order.shippingAddress} />

      {/* Payment Method */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Payment Method
        </h2>
        <p className="text-gray-600">{order.paymentMethod}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          onClick={handleDownloadInvoice}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Download Invoice</span>
        </button>
        <button
          onClick={handleNeedHelp}
          className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-gray-600" />
          <span className="text-gray-600">Need Help?</span>
        </button>
      </div>
    </div>
  );
}
