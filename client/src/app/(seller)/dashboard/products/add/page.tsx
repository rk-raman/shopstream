import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add - ShopStream",
  description: "add page",
};

export default function Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Add</h1>
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">Coming soon</p>
      </div>
    </div>
  );
}