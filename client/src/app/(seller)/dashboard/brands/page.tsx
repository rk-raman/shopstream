"use client";

import React, { useState } from "react";
import { Brand } from "@/types/global";
import { BrandList } from "@/features/seller/components/Brands/BrandList/BrandList";
import { BrandForm } from "@/features/seller/components/Brands/BrandForm/BrandForm";

export default function BrandsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([]);

  const openCreateForm = () => {
    setEditingBrand(null);
    setShowForm(true);
  };

  const openEditForm = (brand: Brand) => {
    setEditingBrand(brand);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingBrand(null);
  };

  return (
    <div className="p-6">
      <BrandList
        onBrandCreate={openCreateForm}
        onBrandEdit={openEditForm}
        selectedBrandIds={selectedBrandIds}
        onSelectionChange={setSelectedBrandIds}
      />

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">
                {editingBrand ? "Edit Brand" : "Add New Brand"}
              </h2>
            </div>
            <div className="p-6">
              <BrandForm
                brand={editingBrand || undefined}
                onSuccess={closeForm}
                onCancel={closeForm}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
