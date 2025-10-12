// client/src/features/customer/account/orders/components/OrderTracking.tsx

import React from "react";
import { CheckCircle } from "lucide-react";
import type { TrackingStep } from "../types";

interface OrderTrackingProps {
  steps: TrackingStep[];
}

export default function OrderTracking({ steps }: OrderTrackingProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Order Tracking
      </h2>
      <div className="relative">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start mb-8 last:mb-0">
            {/* Icon and Line */}
            <div className="flex flex-col items-center mr-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  step.completed
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {step.completed ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <div className="w-3 h-3 bg-white rounded-full" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-0.5 h-16 transition-colors ${
                    step.completed ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-8">
              <p
                className={`font-semibold ${
                  step.completed ? "text-gray-900" : "text-gray-500"
                }`}
              >
                {step.label}
              </p>
              <p className="text-sm text-gray-500 mt-1">{step.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
