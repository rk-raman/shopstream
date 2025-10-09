export interface CheckoutFormData {
  // Shipping Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;

  // Billing Info
  billingSameAsShipping: boolean;
  billingAddress?: string;
  billingCity?: string;
  billingState?: string;
  billingZipCode?: string;

  // Shipping Method
  shippingMethod: "standard" | "express" | "overnight";

  // Payment Info
  cardholderName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardType: "credit" | "debit";
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export const checkoutItems: OrderItem[] = [
  {
    id: "prod_001",
    name: "Premium Wireless Headphones",
    price: 299.99,
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop",
  },
  {
    id: "prod_002",
    name: "Portable Bluetooth Speaker",
    price: 89.99,
    quantity: 2,
    image:
      "https://images.unsplash.com/photo-1589003077984-894e133814c9?w=80&h=80&fit=crop",
  },
];
