// client/src/features/customer/homepage/components/Homepage.tsx
"use client";

import React from "react";
import HeroSection from "./HeroSection";
import FeaturedCategories from "./FeaturedCategories";
import FeaturedProducts from "./FeaturedProducts";
import TrendingCollections from "./TrendingCollections";
import PromoBanner from "./PromoBanner";
import NewsletterSection from "./NewsletterSection";
import BenefitsSection from "./BenefitsSection";

export default function Homepage() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <FeaturedProducts />
      <FeaturedCategories />

      <TrendingCollections />
      <PromoBanner />
      <BenefitsSection />
      <NewsletterSection />
    </div>
  );
}
