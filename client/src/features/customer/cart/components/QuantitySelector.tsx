import { Plus, Minus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  showInput?: boolean;
}

export default function QuantitySelector({
  quantity,
  onIncrement,
  onDecrement,
  onChange,
  min = 1,
  max = 999,
  disabled = false,
  size = "md",
  showInput = false,
}: QuantitySelectorProps) {
  const sizeClasses = {
    sm: {
      button: "p-1",
      text: "text-sm w-8",
      icon: 14,
    },
    md: {
      button: "p-2",
      text: "text-base w-10",
      icon: 16,
    },
    lg: {
      button: "p-3",
      text: "text-lg w-12",
      icon: 18,
    },
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && onChange) {
      onChange(Math.max(min, Math.min(max, value)));
    }
  };

  return (
    <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
      <button
        onClick={onDecrement}
        disabled={disabled || quantity <= min}
        className={`text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-l-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size].button}`}
        aria-label="Decrease quantity"
      >
        <Minus size={sizeClasses[size].icon} />
      </button>

      {showInput ? (
        <input
          type="number"
          value={quantity}
          onChange={handleInputChange}
          min={min}
          max={max}
          disabled={disabled}
          className={`font-semibold text-gray-900 text-center border-x border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 ${sizeClasses[size].text}`}
        />
      ) : (
        <span
          className={`font-semibold text-gray-900 text-center ${sizeClasses[size].text}`}
        >
          {quantity}
        </span>
      )}

      <button
        onClick={onIncrement}
        disabled={disabled || quantity >= max}
        className={`text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-r-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size].button}`}
        aria-label="Increase quantity"
      >
        <Plus size={sizeClasses[size].icon} />
      </button>
    </div>
  );
}
