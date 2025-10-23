"use client";

import React from "react";
import { Plus, Loader2 } from "lucide-react";
import { useAddresses } from "@/features/customer/account/addresses/useAddresses";
import AddressForm from "@/features/customer/account/addresses/components/AddressForm";
import AddressList from "@/features/customer/account/addresses/components/AddressList";
import AddressEmptyState from "@/features/customer/account/addresses/components/AddressEmptyState";
import { Toaster } from "react-hot-toast";

export default function AddressesPage() {
  const {
    addresses,
    isAddingNew,
    editingId,
    formData,
    loading,
    submitting,
    setFormData,
    handleAddNew,
    handleEdit,
    handleSave,
    handleDelete,
    handleSetDefault,
    handleCancel,
  } = useAddresses();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading addresses...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />

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
            submitting={submitting}
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
    </>
  );
}
