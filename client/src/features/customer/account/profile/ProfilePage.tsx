// client/src/features/customer/account/profile/ProfilePage.tsx
"use client";

import React from "react";
import { Edit2, Check, X, Upload, Loader2, Trash2, User } from "lucide-react";
import { useProfile } from "./useProfile";
import FAQSection from "./FAQSection";

export default function ProfilePage() {
  const {
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
  } = useProfile();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-gray-500">Failed to load profile</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Personal Information
          </h2>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                disabled={submitting}
                className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>Save</span>
              </button>
              <button
                onClick={handleCancel}
                disabled={submitting}
                className="flex items-center space-x-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="max-w-2xl">
            {/* Avatar Section */}

            {/* Form Fields */}
            <div className="space-y-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.firstName || ""}
                    onChange={(e) =>
                      handleFieldChange("firstName", e.target.value)
                    }
                    disabled={submitting}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter your first name"
                  />
                ) : (
                  <p className="text-gray-900 py-2 text-lg">
                    {profile.firstName}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.lastName || ""}
                    onChange={(e) =>
                      handleFieldChange("lastName", e.target.value)
                    }
                    disabled={submitting}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter your last name"
                  />
                ) : (
                  <p className="text-gray-900 py-2 text-lg">
                    {profile.lastName}
                  </p>
                )}
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                  {profile.isEmailVerified && (
                    <span className="ml-2 text-xs text-green-600 font-semibold">
                      ✓ Verified
                    </span>
                  )}
                </label>
                <p className="text-gray-600 py-2">{profile.email}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                  {profile.isPhoneVerified && (
                    <span className="ml-2 text-xs text-green-600 font-semibold">
                      ✓ Verified
                    </span>
                  )}
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedProfile.phone || ""}
                    onChange={(e) => handleFieldChange("phone", e.target.value)}
                    disabled={submitting}
                    maxLength={10}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter 10-digit phone number"
                  />
                ) : (
                  <p className="text-gray-900 py-2 text-lg">
                    {profile.phone || "Not provided"}
                  </p>
                )}
              </div>
            </div>

            {/* Info Box */}
            {!isEditing && (
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> Keep your profile information up to
                  date to ensure smooth order deliveries and communication.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <FAQSection />
    </>
  );
}
