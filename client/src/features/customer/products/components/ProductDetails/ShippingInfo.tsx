import { Truck, RotateCcw } from "lucide-react";

export default function ShippingInfo({
  shipping,
}: {
  shipping: {
    freeShipping: boolean;
    estimatedDelivery: string;
    returnsAllowed: boolean;
    returnPeriod: string;
  };
}) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
      <div className="flex gap-3">
        <Truck className="text-blue-600 flex-shrink-0" size={24} />
        <div>
          <h3 className="font-bold text-gray-900">Free Shipping</h3>
          <p className="text-gray-600 text-sm">
            Estimated delivery: {shipping.estimatedDelivery}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <RotateCcw className="text-blue-600 flex-shrink-0" size={24} />
        <div>
          <h3 className="font-bold text-gray-900">Easy Returns</h3>
          <p className="text-gray-600 text-sm">
            {shipping.returnsAllowed
              ? `Return within ${shipping.returnPeriod}`
              : "Returns not allowed"}
          </p>
        </div>
      </div>
    </div>
  );
}
