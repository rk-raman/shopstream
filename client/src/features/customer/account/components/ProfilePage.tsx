// client/src/app/(customer)/account/page.tsx
"use client";

import React, { useState } from "react";
import AccountLayout from "@/features/customer/account/components/AccountLayout";
import { Edit2, Check, X } from "lucide-react";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "John",
    lastName: "Doe",
    phone: "+91 9876543210",
  });

  const [editedProfile, setEditedProfile] = useState(profile);

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
    // TODO: Add API call to save profile
    console.log("Saving profile:", editedProfile);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

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
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Save</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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
            <div className="space-y-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.firstName}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        firstName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
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
                    value={editedProfile.lastName}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        lastName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter your last name"
                  />
                ) : (
                  <p className="text-gray-900 py-2 text-lg">
                    {profile.lastName}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedProfile.phone}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        phone: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <p className="text-gray-900 py-2 text-lg">{profile.phone}</p>
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
      <div className="bg-white rounded-lg shadow-sm mt-6 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Frequently Asked Questions
        </h3>
        <div className="space-y-4">
          <div className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
            <h4 className="font-medium text-gray-900 mb-2">
              How do I update my profile information?
            </h4>
            <p className="text-sm text-gray-600">
              Click the "Edit" button at the top right, make your changes, and
              click "Save" to update your information.
            </p>
          </div>
          <div className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
            <h4 className="font-medium text-gray-900 mb-2">
              What happens when I update my phone number?
            </h4>
            <p className="text-sm text-gray-600">
              Your phone number will be updated across all your orders and
              you'll receive all order-related notifications on your new number.
            </p>
          </div>
          <div className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
            <h4 className="font-medium text-gray-900 mb-2">
              Is my information secure?
            </h4>
            <p className="text-sm text-gray-600">
              Yes, we use industry-standard encryption to protect your personal
              information and never share it with third parties without your
              consent.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
