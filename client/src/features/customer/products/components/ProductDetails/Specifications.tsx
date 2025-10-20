import React from "react";

interface Spec {
  name: string;
  value: string;
  category?: string;
  isRequired?: boolean;
}

export default function Specifications({ specs }: { specs: Spec[] }) {
  if (!Array.isArray(specs) || specs.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Specifications</h2>
        <p className="text-gray-500">No specifications available.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Specifications</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8">
        {specs.map((spec, index) => (
          <div
            key={index}
            className="flex justify-between items-center border-b border-gray-100 pb-2 last:border-0"
          >
            <span className="text-gray-600 font-semibold capitalize">
              {spec.name}
            </span>
            <span className="text-gray-900">{spec.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
