import React from "react";
import { Metadata } from "next";
import ProductImage from "@/features/customer/products/components/ProductDetails/ProductImage";
import ProductHeader from "@/features/customer/products/components/ProductDetails/ProductHeader";
import ProductDescription from "@/features/customer/products/components/ProductDetails/ProductDescription";
import Specifications from "@/features/customer/products/components/ProductDetails/Specifications";
import ShippingInfo from "@/features/customer/products/components/ProductDetails/ShippingInfo";
import Reviews from "@/features/customer/products/components/ProductDetails/Reviews";
import CustomerHeader from "@/components/layout/Header/CustomerHeader/CustomerHeader";
import CustomerFooter from "@/components/layout/Footer/CustomerFooter/CustomerFooter";
import { getProductById } from "@/features/customer/services/productService";

export const metadata: Metadata = {
  title: "Product Details - ShopStream",
  description: "View detailed information about this product",
};

// ✅ `params` must be awaited in Next.js 15+
export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // ✅ Await params before using

  try {
    const response = await getProductById(id);
    console.log("response", response);

    const productData = response?.data?.product;

    if (!productData) {
      return (
        <div className="min-h-screen flex items-center justify-center text-gray-500">
          Product not found.
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-white">
        <CustomerHeader />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <ProductImage images={productData.images} />
            <ProductHeader
              name={productData.name}
              price={productData.discountPrice}
              originalPrice={productData.basePrice}
              rating={productData?.rating?.count || 0}
              reviews={productData.reviews}
              inStock={productData.inStock}
            />
          </div>

          <div className="mb-12">
            <ProductDescription
              description={productData.description}
              features={[]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Specifications specs={productData.specifications} />
            {/* <ShippingInfo shipping={productData.shipping} /> */}
          </div>

          <div className="border-t border-gray-200 pt-8">
            <Reviews reviews={productData?.reviews || []} />
          </div>
        </main>

        <CustomerFooter />
      </div>
    );
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Failed to load product details.
      </div>
    );
  }
}
