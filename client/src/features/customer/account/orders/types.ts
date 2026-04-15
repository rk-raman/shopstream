export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned"
  | "refunded";

export interface OrderItem {
  _id: string;
  product:
    | string
    | {
        _id: string;
        name: string;
        images: { url: string; isMain?: boolean }[];
      };
  productName: string;
  productImage?: string;
  variant?: {
    name: string;
    value: string;
    sku: string;
  };
  quantity: number;
  price: number;
  discountPrice?: number;
  seller: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer:
    | string
    | {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
      };
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingCharges: number;
  discount: number;
  totalAmount: number;
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  status: OrderStatus;
  statusHistory: {
    status: string;
    timestamp: string;
    note?: string;
  }[];
  payment: {
    method: string;
    status: string;
    transactionId?: string;
    paidAt?: string;
  };
  shipping: {
    method: string;
    trackingNumber?: string;
    carrier?: string;
    estimatedDelivery?: string;
    actualDelivery?: string;
  };
  coupon?: {
    code: string;
    discountAmount: number;
    discountType: string;
  };
  cancellationReason?: string;
  returnReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrackingStep {
  label: string;
  date: string;
  completed: boolean;
}

// Helper to build tracking steps from order data
export function buildTrackingSteps(order: Order): TrackingStep[] {
  const allSteps: { status: OrderStatus; label: string }[] = [
    { status: "pending", label: "Order Placed" },
    { status: "confirmed", label: "Order Confirmed" },
    { status: "processing", label: "Processing" },
    { status: "shipped", label: "Shipped" },
    { status: "out_for_delivery", label: "Out for Delivery" },
    { status: "delivered", label: "Delivered" },
  ];

  // If cancelled/returned/refunded, show only up to that status
  if (["cancelled", "returned", "refunded"].includes(order.status)) {
    const steps: TrackingStep[] = [];
    for (const historyEntry of order.statusHistory) {
      const stepDef = allSteps.find((s) => s.status === historyEntry.status);
      steps.push({
        label: stepDef?.label || historyEntry.status,
        date: new Date(historyEntry.timestamp).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
        completed: true,
      });
    }
    // Add the final cancellation/return step
    const lastHistory =
      order.statusHistory[order.statusHistory.length - 1];
    if (
      lastHistory &&
      ["cancelled", "returned", "refunded"].includes(lastHistory.status)
    ) {
      const label =
        lastHistory.status === "cancelled"
          ? "Cancelled"
          : lastHistory.status === "returned"
          ? "Return Requested"
          : "Refunded";
      if (!steps.some((s) => s.label === label)) {
        steps.push({
          label,
          date: new Date(lastHistory.timestamp).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          }),
          completed: true,
        });
      }
    }
    return steps;
  }

  // Normal flow
  const statusOrder: OrderStatus[] = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "out_for_delivery",
    "delivered",
  ];
  const currentIndex = statusOrder.indexOf(order.status);

  return allSteps.map((step, index) => {
    const historyEntry = order.statusHistory.find(
      (h) => h.status === step.status
    );

    return {
      label: step.label,
      date: historyEntry
        ? new Date(historyEntry.timestamp).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : index === currentIndex + 1
        ? "Expected soon"
        : "Pending",
      completed: index <= currentIndex,
    };
  });
}
