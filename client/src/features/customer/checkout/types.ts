// Checkout step identifiers
export type CheckoutStep = "login" | "address" | "summary" | "payment";

// Delivery address shape
export interface DeliveryAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  type: "home" | "office" | "other";
}

// Saved address from user profile
export interface SavedAddress extends DeliveryAddress {
  _id: string;
  isDefault?: boolean;
}

// Checkout item (snapshot from cart)
export interface CheckoutItem {
  _id: string;
  product: string | { _id: string; name: string; images: any[] };
  productName: string;
  productImage: string;
  variant?: {
    variantId: string;
    name: string;
    value: string;
    sku: string;
  };
  quantity: number;
  price: number;
  discountPrice?: number;
  seller?: string;
  deliveryEstimate?: {
    date: string;
    method: string;
  };
}

// Pricing breakdown
export interface CheckoutPricing {
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  tax: number;
  total: number;
}

// Applied coupon
export interface AppliedCoupon {
  couponId: string;
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  discountAmount: number;
}

// User info returned with session
export interface CheckoutUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addresses: SavedAddress[];
}

// Full checkout session
export interface CheckoutSession {
  _id: string;
  user: CheckoutUser;
  status: "active" | "completed" | "abandoned" | "expired";
  currentStep: CheckoutStep;
  selectedAddressId?: string;
  deliveryAddress?: DeliveryAddress;
  items: CheckoutItem[];
  pricing: CheckoutPricing;
  appliedCoupon?: AppliedCoupon;
  selectedPaymentMethod?: string;
  paymentIntentId?: string;
  orderId?: string;
  cartSnapshotAt: string;
  expiresAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Payment method option
export type PaymentMethodType =
  | "upi"
  | "card"
  | "wallet"
  | "cod"
  | "emi"
  | "netbanking";

// Order confirmation data
export interface OrderConfirmation {
  order: {
    _id: string;
    orderNumber: string;
    items: CheckoutItem[];
    totalAmount: number;
    status: string;
    payment: {
      method: string;
      status: string;
    };
    shipping: {
      estimatedDelivery: string;
    };
    createdAt: string;
  };
  deliveryAddress: DeliveryAddress;
  pricing: CheckoutPricing;
  paymentMethod: string;
  placedAt: string;
}

// Step completion state for accordion
export interface StepState {
  step: CheckoutStep;
  label: string;
  number: number;
  isActive: boolean;
  isCompleted: boolean;
  summary?: string;
}
