// client/src/features/customer/account/profile/components/AccountSettingsSection.tsx
"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface AccountSettingsSectionProps {
  submitting: boolean;
  onDeleteAccount: () => void;
  onChangePassword?: () => void;
}

export default function AccountSettingsSection({
  submitting,
  onDeleteAccount,
  onChangePassword,
}: AccountSettingsSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Account Settings
      </h3>
      <div className="space-y-4">
        {/* Change Password */}
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div>
            <h4 className="font-medium text-gray-900">Change Password</h4>
            <p className="text-sm text-gray-600">
              Update your password regularly for security
            </p>
          </div>
          <button
            onClick={onChangePassword}
            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Change
          </button>
        </div>

        {/* Delete Account */}
        <div className="flex items-center justify-between py-3">
          <div>
            <h4 className="font-medium text-red-600">Delete Account</h4>
            <p className="text-sm text-gray-600">
              Permanently delete your account and all data
            </p>
          </div>
          <button
            onClick={onDeleteAccount}
            disabled={submitting}
            className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 disabled:border-gray-300"
          >
            {submitting ? (
              <span className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </span>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
