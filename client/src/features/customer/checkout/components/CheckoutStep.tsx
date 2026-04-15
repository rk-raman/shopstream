"use client";

import { ChevronDown, Check } from "lucide-react";
import type { StepState } from "../types";

interface CheckoutStepProps {
  stepState: StepState;
  onChangeClick: () => void;
  children: React.ReactNode;
}

export default function CheckoutStep({
  stepState,
  onChangeClick,
  children,
}: CheckoutStepProps) {
  const { number, label, isActive, isCompleted, summary } = stepState;

  return (
    <div className="bg-white shadow-sm rounded-sm overflow-hidden">
      {/* Step Header */}
      <div
        className={`flex items-center justify-between px-6 py-4 ${
          isActive ? "bg-[#2874f0] text-white" : "bg-white"
        }`}
      >
        <div className="flex items-center gap-4">
          <span
            className={`flex items-center justify-center w-7 h-7 rounded-sm text-sm font-bold ${
              isActive
                ? "bg-white text-[#2874f0]"
                : isCompleted
                ? "bg-[#2874f0] text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {isCompleted && !isActive ? (
              <Check className="w-4 h-4" />
            ) : (
              number
            )}
          </span>
          <span
            className={`text-sm font-semibold uppercase tracking-wide ${
              isActive
                ? "text-white"
                : isCompleted
                ? "text-gray-800"
                : "text-gray-400"
            }`}
          >
            {label}
          </span>

          {/* Collapsed summary */}
          {!isActive && isCompleted && summary && (
            <span className="text-sm text-gray-500 ml-2 truncate max-w-md">
              -- {summary}
            </span>
          )}
        </div>

        {/* CHANGE button */}
        {!isActive && isCompleted && (
          <button
            onClick={onChangeClick}
            className="px-4 py-1 text-sm font-semibold text-[#2874f0] bg-white border border-gray-300 rounded-sm hover:shadow-sm transition-shadow"
          >
            CHANGE
          </button>
        )}
      </div>

      {/* Step Content (expanded) */}
      {isActive && (
        <div className="px-6 py-5 border-t border-gray-100">{children}</div>
      )}
    </div>
  );
}
