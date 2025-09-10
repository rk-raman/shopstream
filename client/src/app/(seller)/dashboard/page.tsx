import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seller Dashboard - ShopStream",
  description: "Manage your products, orders, and business analytics",
};

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Seller Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Products</h3>
          <p className="text-3xl font-bold text-indigo-600">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Orders</h3>
          <p className="text-3xl font-bold text-green-600">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Revenue</h3>
          <p className="text-3xl font-bold text-blue-600">$0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Customers</h3>
          <p className="text-3xl font-bold text-purple-600">0</p>
        </div>
      </div>
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">
          Welcome to your seller dashboard
        </p>
        <p className="text-gray-400 mt-2">Start by adding your first product</p>
        <a
          href="/dashboard/products/add"
          className="mt-4 inline-block bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Add Product
        </a>
      </div>
    </div>
  );
}
