"use client";

import React from "react";
import { Edit2, Trash2, Home, Briefcase } from "lucide-react";
import type { Address } from "../types";

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export default function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}: AddressCardProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm p-6 border-2 ${
        address.isDefault ? "border-blue-500 relative" : "border-transparent"
      }`}
    >
      {address.isDefault && (
        <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
          Default
        </div>
      )}

      <div className="flex items-start space-x-3 mb-4">
        {address.addressType === "home" ? (
          <Home className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
        ) : (
          <Briefcase className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
        )}
        <div>
          <h3 className="font-semibold text-gray-900">{address.name}</h3>
          <p className="text-sm text-gray-600 capitalize">
            {address.addressType}
          </p>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <p>{address.address}</p>
        {address.landmark && <p>Landmark: {address.landmark}</p>}
        <p>{address.locality}</p>
        <p>
          {address.city}, {address.state} - {address.pincode}
        </p>
        <p className="font-medium text-gray-900">Ph: {address.phone}</p>
      </div>

      <div className="flex space-x-3 pt-4 border-t border-gray-200">
        <button
          onClick={() => onEdit(address)}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
          <span>Edit</span>
        </button>
        <button
          onClick={() => onDelete(address.id)}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </button>
      </div>

      {!address.isDefault && (
        <button
          onClick={() => onSetDefault(address.id)}
          className="w-full mt-3 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          Set as Default
        </button>
      )}
    </div>
  );
}
