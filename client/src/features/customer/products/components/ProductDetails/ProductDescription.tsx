export default function ProductDescription({
  description,
  features,
}: {
  description: string;
  features: string[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          About this product
        </h2>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">Key Features</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-1">✓</span>
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
