interface CheckoutProgressProps {
  currentStep: number;
}

export default function CheckoutProgress({
  currentStep,
}: CheckoutProgressProps) {
  const steps = [
    { number: 1, label: "Shipping", icon: "📦" },
    { number: 2, label: "Billing", icon: "💳" },
    { number: 3, label: "Payment", icon: "💰" },
    { number: 4, label: "Review", icon: "✓" },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold transition ${
                currentStep >= step.number
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {currentStep > step.number ? "✓" : step.number}
            </div>

            <div
              className={`flex-1 h-1 mx-2 transition ${
                currentStep > step.number ? "bg-blue-600" : "bg-gray-200"
              }`}
            />
          </div>
        ))}

        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 text-gray-600 text-lg font-bold">
          ✓
        </div>
      </div>

      <div className="flex justify-between mt-3">
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-center">
            <span className="text-xs font-semibold text-gray-600 mt-2">
              {step.label}
            </span>
          </div>
        ))}
        <div className="flex flex-col items-center">
          <span className="text-xs font-semibold text-gray-600 mt-2">
            Complete
          </span>
        </div>
      </div>
    </div>
  );
}
