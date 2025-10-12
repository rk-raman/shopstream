"use client";

import React from "react";
import { MapPin, Plus } from "lucide-react";

interface AddressEmptyStateProps {
  onAddClick: () => void;
}

export default function AddressEmptyState({
  onAddClick,
}: AddressEmptyStateProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
      <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500 text-lg mb-6">No addresses saved yet</p>
      <button
        onClick={onAddClick}
        className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        <Plus className="w-5 h-5" />
        <span>Add Your First Address</span>
      </button>
    </div>
  );
}
