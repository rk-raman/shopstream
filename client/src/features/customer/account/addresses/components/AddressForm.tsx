"use client";

import React from "react";
import { Check, X, Loader2 } from "lucide-react";
import type { Address } from "../types";

interface AddressFormProps {
  formData: Partial<Address> | null;
  isEditing: boolean;
  submitting: boolean;
  onFormDataChange: (data: Partial<Address>) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function AddressForm({
  formData,
  isEditing,
  submitting,
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
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.fullName || ""}
            onChange={(e) =>
              onFormDataChange({ ...formData, fullName: e.target.value })
            }
            placeholder="Enter your full name"
            disabled={submitting}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.phone || ""}
            onChange={(e) =>
              onFormDataChange({ ...formData, phone: e.target.value })
            }
            placeholder="10-digit number"
            maxLength={10}
            disabled={submitting}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* Address Line 1 */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address Line 1 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.addressLine1 || ""}
            onChange={(e) =>
              onFormDataChange({ ...formData, addressLine1: e.target.value })
            }
            placeholder="House No., Building Name, Street"
            rows={2}
            disabled={submitting}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* Address Line 2 */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address Line 2 (Optional)
          </label>
          <input
            type="text"
            value={formData.addressLine2 || ""}
            onChange={(e) =>
              onFormDataChange({ ...formData, addressLine2: e.target.value })
            }
            placeholder="Area, Colony"
            disabled={submitting}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
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
            disabled={submitting}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.city || ""}
            onChange={(e) =>
              onFormDataChange({ ...formData, city: e.target.value })
            }
            placeholder="City"
            disabled={submitting}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.state || ""}
            onChange={(e) =>
              onFormDataChange({ ...formData, state: e.target.value })
            }
            placeholder="State"
            disabled={submitting}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* Pincode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pincode <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.pincode || ""}
            onChange={(e) =>
              onFormDataChange({ ...formData, pincode: e.target.value })
            }
            placeholder="6-digit pincode"
            maxLength={6}
            disabled={submitting}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country
          </label>
          <input
            type="text"
            value={formData.country || "India"}
            onChange={(e) =>
              onFormDataChange({ ...formData, country: e.target.value })
            }
            placeholder="Country"
            disabled={submitting}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* Address Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address Type
          </label>
          <select
            value={formData.type || "home"}
            onChange={(e) =>
              onFormDataChange({
                ...formData,
                type: e.target.value as "home" | "work" | "other",
              })
            }
            disabled={submitting}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="home">Home</option>
            <option value="work">Work</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Set as Default */}
        <div className="flex items-center space-x-2 pt-2">
          <input
            type="checkbox"
            id="isDefault"
            checked={formData.isDefault || false}
            onChange={(e) =>
              onFormDataChange({ ...formData, isDefault: e.target.checked })
            }
            disabled={submitting}
            className="w-4 h-4 disabled:cursor-not-allowed"
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
          disabled={submitting}
          className="inline-flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Save Address</span>
            </>
          )}
        </button>
        <button
          onClick={onCancel}
          disabled={submitting}
          className="inline-flex items-center space-x-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <X className="w-4 h-4" />
          <span>Cancel</span>
        </button>
      </div>
    </div>
  );
}
