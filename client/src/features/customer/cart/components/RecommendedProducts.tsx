import Image from "next/image";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
}

const recommendedProducts: Product[] = [
  {
    id: "rec_001",
    name: "Wireless Charging Pad",
    price: 34.99,
    image:
      "https://images.unsplash.com/photo-1591290619224-afc85e12d6e3?w=200&h=200&fit=crop",
    rating: 4.7,
  },
  {
    id: "rec_002",
    name: "Phone Stand",
    price: 24.99,
    image:
      "https://images.unsplash.com/photo-1527814050087-3793815479db?w=200&h=200&fit=crop",
    rating: 4.5,
  },
  {
    id: "rec_003",
    name: "Screen Protector",
    price: 14.99,
    image:
      "https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=200&h=200&fit=crop",
    rating: 4.8,
  },
];

export default function RecommendedProducts() {
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        You might also like
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendedProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
          >
            <div className="aspect-square bg-gray-100 overflow-hidden">
              <Image
                src={product.image}
                alt={product.name}
                width={200}
                height={200}
                className="w-full h-full object-cover hover:scale-105 transition"
              />
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                {product.name}
              </h3>

              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-sm text-yellow-500">
                  ★ {product.rating}
                </span>
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition">
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
