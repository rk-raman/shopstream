// client/src/features/customer/account/profile/useProfile.ts

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { userService } from "../../services/userService";
import type { UserProfile, UpdateProfilePayload } from "../types";

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userService.getProfile();

      if (response.success && response.data) {
        setProfile((response?.data as any)?.user);
        setEditedProfile((response?.data as any)?.user);
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast.error(error.message || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (profile) {
      setEditedProfile({ ...profile });
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setEditedProfile({ ...profile });
    }
    setIsEditing(false);
  };

  const validateForm = (): boolean => {
    if (!editedProfile.firstName?.trim()) {
      toast.error("First name is required");
      return false;
    }

    if (!editedProfile.lastName?.trim()) {
      toast.error("Last name is required");
      return false;
    }

    if (editedProfile.phone) {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(editedProfile.phone)) {
        toast.error("Please enter a valid 10-digit phone number");
        return false;
      }
    }

    if (editedProfile.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editedProfile.email)) {
        toast.error("Please enter a valid email address");
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const payload: UpdateProfilePayload = {
        firstName: editedProfile.firstName,
        lastName: editedProfile.lastName,
        phone: editedProfile.phone,
      };

      const response = await userService.updateProfile(payload);

      if (response.success && response.data) {
        setProfile((response?.data as any)?.user);
        setEditedProfile((response?.data as any)?.user);
        setIsEditing(false);
        toast.success("Profile updated successfully");
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFieldChange = (field: keyof UserProfile, value: any) => {
    setEditedProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      setSubmitting(true);

      const response = await userService.uploadAvatar(file);

      if (response.success && response.data) {
        setProfile((response?.data as any)?.user);
        setEditedProfile((response?.data as any)?.user);
        toast.success("Avatar uploaded successfully");
      }
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast.error(error.message || "Failed to upload avatar");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    // Confirm deletion
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmed) return;

    // Double confirmation
    const doubleConfirmed = window.confirm(
      "This will permanently delete all your data. Are you absolutely sure?"
    );

    if (!doubleConfirmed) return;

    try {
      setSubmitting(true);

      const response = await userService.deleteAccount();

      if (response.success) {
        toast.success("Account deleted successfully");
        // Redirect to home page or logout
        window.location.href = "/";
      }
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.error(error.message || "Failed to delete account");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    profile,
    isEditing,
    editedProfile,
    loading,
    submitting,
    handleEdit,
    handleCancel,
    handleSave,
    handleFieldChange,
    handleAvatarUpload,
    handleDeleteAccount,
    refreshProfile: fetchProfile,
  };
}
