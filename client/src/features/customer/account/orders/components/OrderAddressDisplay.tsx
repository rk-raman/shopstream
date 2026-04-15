"use client";

import React from "react";
import { MapPin } from "lucide-react";
import type { ShippingAddress } from "../types";

interface OrderAddressDisplayProps {
  address: ShippingAddress;
}

export default function OrderAddressDisplay({
  address,
}: OrderAddressDisplayProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center space-x-2 mb-4">
        <MapPin className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          Shipping Address
        </h2>
      </div>
      <div className="space-y-1 text-gray-600">
        <p className="font-semibold text-gray-900">{address.fullName}</p>
        <p>{address.addressLine1}</p>
        {address.addressLine2 && <p>{address.addressLine2}</p>}
        <p>
          {address.city}, {address.state} - {address.pincode}
        </p>
        {address.country && address.country !== "India" && (
          <p>{address.country}</p>
        )}
        <p className="mt-3 font-medium text-gray-900">
          Phone: <span className="font-normal">{address.phone}</span>
        </p>
      </div>
    </div>
  );
}
