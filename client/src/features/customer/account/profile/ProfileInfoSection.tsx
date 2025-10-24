// client/src/features/customer/account/profile/components/ProfileInfoSection.tsx
"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import type { UserProfile } from "../types";

interface ProfileInfoSectionProps {
  profile: UserProfile;
  isEditing: boolean;
  editedProfile: Partial<UserProfile>;
  submitting: boolean;
  onFieldChange: (field: keyof UserProfile, value: any) => void;
}

export default function ProfileInfoSection({
  profile,
  isEditing,
  editedProfile,
  submitting,
  onFieldChange,
}: ProfileInfoSectionProps) {
  return (
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
            onChange={(e) => onFieldChange("firstName", e.target.value)}
            disabled={submitting}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Enter your first name"
          />
        ) : (
          <p className="text-gray-900 py-2 text-lg">{profile.firstName}</p>
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
            onChange={(e) => onFieldChange("lastName", e.target.value)}
            disabled={submitting}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Enter your last name"
          />
        ) : (
          <p className="text-gray-900 py-2 text-lg">{profile.lastName}</p>
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
        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
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
            onChange={(e) => onFieldChange("phone", e.target.value)}
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

      {/* Gender */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Gender
        </label>
        {isEditing ? (
          <select
            value={editedProfile.gender || ""}
            onChange={(e) =>
              onFieldChange(
                "gender",
                e.target.value as "male" | "female" | "other"
              )
            }
            disabled={submitting}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        ) : (
          <p className="text-gray-900 py-2 text-lg capitalize">
            {profile.gender || "Not specified"}
          </p>
        )}
      </div>

      {/* Date of Birth */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date of Birth
        </label>
        {isEditing ? (
          <input
            type="date"
            value={
              editedProfile.dateOfBirth
                ? new Date(editedProfile.dateOfBirth)
                    .toISOString()
                    .split("T")[0]
                : ""
            }
            onChange={(e) => onFieldChange("dateOfBirth", e.target.value)}
            disabled={submitting}
            max={new Date().toISOString().split("T")[0]}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        ) : (
          <p className="text-gray-900 py-2 text-lg">
            {profile.dateOfBirth
              ? new Date(profile.dateOfBirth).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "Not provided"}
          </p>
        )}
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bio
        </label>
        {isEditing ? (
          <>
            <textarea
              value={editedProfile.bio || ""}
              onChange={(e) => onFieldChange("bio", e.target.value)}
              disabled={submitting}
              rows={4}
              maxLength={500}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Tell us about yourself (max 500 characters)"
            />
            <p className="text-xs text-gray-500 mt-1">
              {(editedProfile.bio || "").length}/500 characters
            </p>
          </>
        ) : (
          <p className="text-gray-900 py-2">{profile.bio || "No bio added"}</p>
        )}
      </div>
    </div>
  );
}
