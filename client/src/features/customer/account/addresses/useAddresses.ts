import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import type {
  Address,
  CreateAddressPayload,
  UpdateAddressPayload,
} from "../types";
import { userService } from "../../services/userService";

export function useAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Address> | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch addresses on mount
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await userService.getAddresses();
      console.log("response", response);

      if (response.success && response.data) {
        // Handle both array and single address response
        const addressArray = Array.isArray(response.data)
          ? response.data
          : [response.data];
        setAddresses(addressArray);
      }
    } catch (error: any) {
      console.error("Error fetching addresses:", error);
      toast.error(error.message || "Failed to fetch addresses");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setFormData({
      type: "home",
      fullName: "",
      phone: "",
      pincode: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      country: "India",
      landmark: "",
      isDefault: addresses.length === 0, // First address is default
    });
    setIsAddingNew(true);
    setEditingId(null);
  };

  const handleEdit = (address: Address) => {
    setFormData({ ...address });
    setEditingId(address._id);
    setIsAddingNew(false);
  };

  const validateForm = (): boolean => {
    if (!formData) return false;

    const requiredFields = [
      "fullName",
      "phone",
      "pincode",
      "addressLine1",
      "city",
      "state",
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]?.toString().trim()) {
        toast.error(
          `Please fill in ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`
        );
        return false;
      }
    }

    // Validate phone number (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone?.toString() || "")) {
      toast.error("Please enter a valid 10-digit phone number");
      return false;
    }

    // Validate pincode (6 digits)
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(formData.pincode?.toString() || "")) {
      toast.error("Please enter a valid 6-digit pincode");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm() || !formData) return;

    try {
      setSubmitting(true);

      if (isAddingNew) {
        // Create new address
        const payload: CreateAddressPayload = {
          type: formData.type as "home" | "work" | "other",
          fullName: formData.fullName!,
          phone: formData.phone!,
          pincode: formData.pincode!,
          addressLine1: formData.addressLine1!,
          addressLine2: formData.addressLine2,
          city: formData.city!,
          state: formData.state!,
          country: formData.country || "India",
          landmark: formData.landmark,
          isDefault: formData.isDefault || false,
        };

        const response = await userService.addAddress(payload);

        if (response.success) {
          toast.success("Address added successfully");
          await fetchAddresses(); // Refresh the list
        }
      } else if (editingId) {
        // Update existing address
        const payload: UpdateAddressPayload = {
          _id: editingId,
          type: formData.type as "home" | "work" | "other",
          fullName: formData.fullName,
          phone: formData.phone,
          pincode: formData.pincode,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          landmark: formData.landmark,
          isDefault: formData.isDefault,
        };

        const response = await userService.updateAddress(payload, editingId);

        if (response.success) {
          toast.success("Address updated successfully");
          await fetchAddresses(); // Refresh the list
        }
      }

      // Reset form state
      setFormData(null);
      setEditingId(null);
      setIsAddingNew(false);
    } catch (error: any) {
      console.error("Error saving address:", error);
      toast.error(error.message || "Failed to save address");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    // Confirm deletion
    if (!window.confirm("Are you sure you want to delete this address?")) {
      return;
    }

    try {
      const response = await userService.deleteAddress(id);

      if (response.success) {
        toast.success("Address deleted successfully");
        await fetchAddresses(); // Refresh the list
      }
    } catch (error: any) {
      console.error("Error deleting address:", error);
      toast.error(error.message || "Failed to delete address");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const addressToUpdate = addresses.find((addr) => addr._id === id);
      if (!addressToUpdate) return;

      const payload: UpdateAddressPayload = {
        _id: id,
        isDefault: true,
      };

      const response = await userService.updateAddress(payload, id);

      if (response.success) {
        toast.success("Default address updated");
        await fetchAddresses(); // Refresh the list
      }
    } catch (error: any) {
      console.error("Error setting default address:", error);
      toast.error(error.message || "Failed to set default address");
    }
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
    loading,
    submitting,
    setFormData,
    handleAddNew,
    handleEdit,
    handleSave,
    handleDelete,
    handleSetDefault,
    handleCancel,
    refreshAddresses: fetchAddresses,
  };
}
