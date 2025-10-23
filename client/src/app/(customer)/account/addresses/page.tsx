// client/src/app/(customer)/account/addresses/page.tsx
"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Address } from "@/features/customer/account/types";
import { useAddresses } from "@/features/customer/account/addresses/useAddresses";
import AddressForm from "@/features/customer/account/addresses/components/AddressForm";
import AddressList from "@/features/customer/account/addresses/components/AddressList";
import AddressEmptyState from "@/features/customer/account/addresses/components/AddressEmptyState";

// Mock data - Replace with API call
const mockAddresses: any[] = [
  {
    _id: "1",
    fullName: "Radharaman kar",
    type: "home",
    phone: "9876543210",
    pincode: "600001",
    landmark: "T Nagar",
    addressLine1: "123, Main Street, Anna Nagar",
    addressLine2: "Near Bus Stop",
    city: "Chennai",
    state: "Tamil Nadu",
    coordinates: { latitude: 13.0827, longitude: 80.2707 },
    isDefault: true,
  },
  {
    _id: "2",
    fullName: "Radharaman kar",
    type: "work",
    phone: "9876543210",
    pincode: "600001",
    landmark: "T Nagar",
    addressLine1: "123, Main Street, Anna Nagar",
    addressLine2: "Near Bus Stop",
    city: "Chennai",
    state: "Tamil Nadu",
    coordinates: { latitude: 13.0827, longitude: 80.2707 },
    isDefault: true,
  },
];

export default function AddressesPage() {
  const {
    addresses,
    isAddingNew,
    editingId,
    formData,
    setFormData,
    handleAddNew,
    handleEdit,
    handleSave,
    handleDelete,
    handleSetDefault,
    handleCancel,
  } = useAddresses(mockAddresses);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Manage Addresses</h1>
        {!isAddingNew && !editingId && (
          <button
            onClick={handleAddNew}
            className="inline-flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Address</span>
          </button>
        )}
      </div>

      {/* Form Section */}
      {(isAddingNew || editingId) && (
        <AddressForm
          formData={formData}
          isEditing={!!editingId}
          onFormDataChange={setFormData}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {/* Addresses List or Empty State */}
      {addresses.length > 0 && !isAddingNew && !editingId ? (
        <AddressList
          addresses={addresses}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSetDefault={handleSetDefault}
        />
      ) : !isAddingNew && !editingId ? (
        <AddressEmptyState onAddClick={handleAddNew} />
      ) : null}
    </div>
  );
}
