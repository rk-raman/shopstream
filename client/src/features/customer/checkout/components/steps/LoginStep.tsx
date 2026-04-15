"use client";

import { useCheckout } from "../../context/CheckoutContext";
import { User, Mail, Phone } from "lucide-react";

export default function LoginStep() {
  const { session } = useCheckout();

  if (!session) return null;

  const { user } = session;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-6 h-6 text-[#2874f0]" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900">
            {user.firstName} {user.lastName}
          </h3>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" />
              {user.email}
            </span>
            {user.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                {user.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-2">
        Logged in successfully. Continue to select delivery address.
      </p>
    </div>
  );
}
