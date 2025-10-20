// client/src/features/customer/cart/components/PromoCode.tsx

import { Tag, X } from "lucide-react";
import { useState } from "react";

interface PromoCodeProps {
  onApply: (code: string) => Promise<void>;
  onRemove?: () => Promise<void>;
  currentCode?: string;
}

export default function PromoCode({
  onApply,
  onRemove,
  currentCode,
}: PromoCodeProps) {
  const [code, setCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) {
      return;
    }

    setIsApplying(true);
    try {
      await onApply(code.toUpperCase());
      setCode("");
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemove = async () => {
    if (onRemove) {
      setIsApplying(true);
      try {
        await onRemove();
      } finally {
        setIsApplying(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleApply();
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Tag size={20} className="text-blue-600" />
        <h3 className="font-semibold text-gray-900">Have a promo code?</h3>
      </div>

      {currentCode ? (
        <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-green-300">
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-semibold">{currentCode}</span>
            <span className="text-xs text-gray-600">Applied</span>
          </div>
          <button
            onClick={handleRemove}
            disabled={isApplying}
            className="text-red-600 hover:text-red-800 disabled:opacity-50"
            aria-label="Remove promo code"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="Enter code"
              disabled={isApplying}
              className="flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed uppercase"
            />
            <button
              onClick={handleApply}
              disabled={isApplying || !code.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px]"
            >
              {isApplying ? "..." : "Apply"}
            </button>
          </div>

          <div className="mt-3 text-xs text-gray-600">
            <p className="font-semibold mb-1">Available codes:</p>
            <ul className="space-y-1">
              <li>• SAVE10 - 10% off</li>
              <li>• SAVE20 - 20% off</li>
              <li>• WELCOME15 - 15% off first order</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
