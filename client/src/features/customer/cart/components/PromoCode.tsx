import { Tag } from "lucide-react";
import { useState } from "react";

interface PromoCodeProps {
  onApply: (code: string, discount: number) => void;
}

export default function PromoCode({ onApply }: PromoCodeProps) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const validCodes: Record<string, number> = {
    SAVE10: 10,
    SAVE20: 20,
    FREESHIP: 0,
  };

  const handleApply = () => {
    if (!code.trim()) {
      setMessage("Please enter a code");
      setIsSuccess(false);
      return;
    }

    const discount = validCodes[code.toUpperCase()];
    if (discount !== undefined) {
      setMessage(`Code applied! ${discount}% off`);
      setIsSuccess(true);
      onApply(code.toUpperCase(), discount);
      setCode("");
    } else {
      setMessage("Invalid promo code");
      setIsSuccess(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Tag size={20} className="text-blue-600" />
        <h3 className="font-semibold text-gray-900">Have a promo code?</h3>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter code (e.g., SAVE10)"
          className="flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleApply}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition"
        >
          Apply
        </button>
      </div>

      {message && (
        <p
          className={`text-sm mt-2 ${
            isSuccess ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
