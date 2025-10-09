export default function Specifications({
  specs,
}: {
  specs: Record<string, string>;
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Specifications</h2>
      <div className="space-y-3">
        {Object.entries(specs).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center">
            <span className="text-gray-600 font-semibold capitalize">
              {key.replace(/([A-Z])/g, " $1").trim()}:
            </span>
            <span className="text-gray-900">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
