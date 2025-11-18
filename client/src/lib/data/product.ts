export const productData = {
  id: "prod_001",
  name: "Premium Wireless Headphones",
  price: 299.99,
  originalPrice: 399.98,
  rating: 4.8,
  reviews: 1250,
  inStock: true,
  category: "Electronics",
  image:
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop",
  images: [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop",
    "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop",
    "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=800&h=800&fit=crop",
  ],
  description:
    "Experience premium sound quality with our wireless headphones. Featuring active noise cancellation, 30-hour battery life, and premium comfort for all-day wear.",
  features: [
    "Active Noise Cancellation (ANC)",
    "30-hour battery life",
    "Bluetooth 5.0 connectivity",
    "Comfortable over-ear design",
    "Built-in microphone for calls",
    "Foldable design for portability",
  ],
  specifications: {
    brand: "AudioMax",
    model: "PM-5000",
    weight: "250g",
    color: "Midnight Black",
    warranty: "2 years",
    connectivity: "Bluetooth 5.0, 3.5mm jack",
    batteryLife: "30 hours",
  },
  reviews_data: [
    {
      id: 1,
      author: "John Doe",
      rating: 5,
      title: "Best headphones ever!",
      comment:
        "Amazing sound quality and extremely comfortable. Worth every penny.",
      date: "2024-10-01",
    },
    {
      id: 2,
      author: "Sarah Smith",
      rating: 4,
      title: "Great product",
      comment: "Good value for money. Battery life is exceptional.",
      date: "2024-09-28",
    },
  ],
  shipping: {
    freeShipping: true,
    estimatedDelivery: "3-5 business days",
    returnsAllowed: true,
    returnPeriod: "30 days",
  },
};

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
  inStock: boolean;
}

export const initialCartItems: CartItem[] = [
  {
    id: "prod_001",
    name: "Premium Wireless Headphones",
    price: 299.99,
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop",
    category: "Electronics",
    inStock: true,
  },
  {
    id: "prod_002",
    name: "Portable Bluetooth Speaker",
    price: 89.99,
    quantity: 2,
    image:
      "https://images.unsplash.com/photo-1589003077984-894e133814c9?w=200&h=200&fit=crop",
    category: "Electronics",
    inStock: true,
  },
  {
    id: "prod_003",
    name: "USB-C Charging Cable",
    price: 19.99,
    quantity: 3,
    image:
      "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=200&h=200&fit=crop",
    category: "Accessories",
    inStock: true,
  },
];
