// client/src/features/customer/account/profile/components/ProfileAvatarSection.tsx
"use client";

import React from "react";
import { Upload, Loader2, User } from "lucide-react";
import type { UserProfile } from "../types";

interface ProfileAvatarSectionProps {
  profile: UserProfile;
  submitting: boolean;
  onAvatarUpload: (file: File) => void;
}

export default function ProfileAvatarSection({
  profile,
  submitting,
  onAvatarUpload,
}: ProfileAvatarSectionProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("File size must be less than 2MB");
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a valid image file (JPG, PNG, or WEBP)");
      return;
    }

    onAvatarUpload(file);
  };

  return (
    <div className="mb-8 pb-8 border-b border-gray-200">
      <div className="flex items-center space-x-6">
        {/* Avatar Display */}
        <div className="relative">
          {profile.avatar?.url ? (
            <img
              src={profile.avatar.url}
              alt={`${profile.firstName} ${profile.lastName}`}
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center border-4 border-gray-200">
              <User className="w-12 h-12 text-blue-600" />
            </div>
          )}

          {/* Loading Overlay */}
          {submitting && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Upload Section */}
        <div>
          <p className="font-semibold text-gray-900 mb-1">Profile Picture</p>
          <p className="text-sm text-gray-600 mb-3">
            JPG, PNG or WEBP. Max size 2MB
          </p>
          <label className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed">
            <Upload className="w-4 h-4" />
            <span>{submitting ? "Uploading..." : "Upload Photo"}</span>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
              disabled={submitting}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
