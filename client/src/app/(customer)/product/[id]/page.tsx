import React from "react";
import { Metadata } from "next";
import { productData } from "@/lib/data/product";
import ProductImage from "@/features/customer/products/components/ProductDetails/ProductImage";
import ProductHeader from "@/features/customer/products/components/ProductDetails/ProductHeader";
import ProductDescription from "@/features/customer/products/components/ProductDetails/ProductDescription";
import Specifications from "@/features/customer/products/components/ProductDetails/Specifications";
import ShippingInfo from "@/features/customer/products/components/ProductDetails/ShippingInfo";
import Reviews from "@/features/customer/products/components/ProductDetails/Reviews";
import CustomerHeader from "@/components/layout/Header/CustomerHeader/CustomerHeader";
import CustomerFooter from "@/components/layout/Footer/CustomerFooter/CustomerFooter";

export const metadata: Metadata = {
  title: "Shopping Cart - ShopStream",
  description: "Review your cart items and proceed to checkout",
};

export default function CartPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <CustomerHeader />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Product Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <ProductImage images={productData.images} />
          <ProductHeader
            name={productData.name}
            price={productData.price}
            originalPrice={productData.originalPrice}
            rating={productData.rating}
            reviews={productData.reviews}
            inStock={productData.inStock}
          />
        </div>

        {/* Description and Features */}
        <div className="mb-12">
          <ProductDescription
            description={productData.description}
            features={productData.features}
          />
        </div>

        {/* Specifications and Shipping */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Specifications specs={productData.specifications} />
          <ShippingInfo shipping={productData.shipping} />
        </div>

        {/* Reviews */}
        <div className="border-t border-gray-200 pt-8">
          <Reviews reviews={productData.reviews_data} />
        </div>
      </main>

      {/* Footer */}
      <CustomerFooter />
    </div>
  );
}
