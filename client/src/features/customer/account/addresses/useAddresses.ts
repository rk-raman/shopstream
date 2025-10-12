import { useState } from "react";
import type { Address } from "../types";

export function useAddresses(initialAddresses: Address[]) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Address | null>(null);

  const handleAddNew = () => {
    setFormData({
      id: "",
      name: "",
      phone: "",
      pincode: "",
      locality: "",
      address: "",
      city: "",
      state: "",
      addressType: "home",
      isDefault: false,
    });
    setIsAddingNew(true);
    setEditingId(null);
  };

  const handleEdit = (address: Address) => {
    setFormData({ ...address });
    setEditingId(address.id);
    setIsAddingNew(false);
  };

  const handleSave = () => {
    if (!formData || !formData.name.trim()) return;

    if (isAddingNew) {
      const newAddress = {
        ...formData,
        id: Date.now().toString(),
      };
      setAddresses([...addresses, newAddress]);
    } else if (editingId) {
      setAddresses(
        addresses.map((addr) => (addr.id === editingId ? formData : addr))
      );
    }

    setFormData(null);
    setEditingId(null);
    setIsAddingNew(false);
  };

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter((addr) => addr.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
  };

  const handleCancel = () => {
    setFormData(null);
    setEditingId(null);
    setIsAddingNew(false);
  };

  return {
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
  };
}
