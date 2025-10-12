"use client";

import React from "react";
import { Check, X } from "lucide-react";
import type { Address } from "../types";

interface AddressFormProps {
  formData: Address | null;
  isEditing: boolean;
  onFormDataChange: (data: Address) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function AddressForm({
  formData,
  isEditing,
  onFormDataChange,
  onSave,
  onCancel,
}: AddressFormProps) {
  if (!formData) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {isEditing ? "Edit Address" : "Add New Address"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              onFormDataChange({ ...formData, name: e.target.value })
            }
            placeholder="e.g., Home, Office"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              onFormDataChange({ ...formData, phone: e.target.value })
            }
            placeholder="10-digit number"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.address}
            onChange={(e) =>
              onFormDataChange({ ...formData, address: e.target.value })
            }
            placeholder="House No., Street, Locality"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Landmark */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Landmark (Optional)
          </label>
          <input
            type="text"
            value={formData.landmark || ""}
            onChange={(e) =>
              onFormDataChange({ ...formData, landmark: e.target.value })
            }
            placeholder="e.g., Near Metro Station"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Locality */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Locality <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.locality}
            onChange={(e) =>
              onFormDataChange({ ...formData, locality: e.target.value })
            }
            placeholder="Locality"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) =>
              onFormDataChange({ ...formData, city: e.target.value })
            }
            placeholder="City"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.state}
            onChange={(e) =>
              onFormDataChange({ ...formData, state: e.target.value })
            }
            placeholder="State"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Pincode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pincode <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.pincode}
            onChange={(e) =>
              onFormDataChange({ ...formData, pincode: e.target.value })
            }
            placeholder="6-digit pincode"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Address Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address Type
          </label>
          <select
            value={formData.addressType}
            onChange={(e) =>
              onFormDataChange({
                ...formData,
                addressType: e.target.value as "home" | "work",
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="home">Home</option>
            <option value="work">Work</option>
          </select>
        </div>

        {/* Set as Default */}
        <div className="flex items-center space-x-2 pt-2">
          <input
            type="checkbox"
            id="isDefault"
            checked={formData.isDefault}
            onChange={(e) =>
              onFormDataChange({ ...formData, isDefault: e.target.checked })
            }
            className="w-4 h-4"
          />
          <label htmlFor="isDefault" className="text-sm text-gray-700">
            Set as default address
          </label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex space-x-3 mt-8">
        <button
          onClick={onSave}
          className="inline-flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Check className="w-4 h-4" />
          <span>Save Address</span>
        </button>
        <button
          onClick={onCancel}
          className="inline-flex items-center space-x-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <X className="w-4 h-4" />
          <span>Cancel</span>
        </button>
      </div>
    </div>
  );
}
