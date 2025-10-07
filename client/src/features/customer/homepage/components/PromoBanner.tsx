import React, { useState } from "react";
import { X, Sparkles, ArrowRight } from "lucide-react";

const PromoBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(true);

  if (!isVisible) return null;

  return (
    <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 text-white py-3 px-4 overflow-hidden">
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>

      <div className="relative max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Content */}
        <div className="flex items-center gap-3 flex-1 justify-center">
          <Sparkles className="w-5 h-5 flex-shrink-0 animate-pulse" />

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-center sm:text-left">
            <span className="font-bold text-sm sm:text-base">
              Limited Time Offer!
            </span>
            <span className="text-xs sm:text-sm text-white/90">
              Get 50% off on all premium plans • Ends in 48 hours
            </span>
          </div>

          <button className="hidden sm:flex items-center gap-2 bg-white text-purple-600 px-4 py-2 rounded-full font-semibold text-sm hover:bg-gray-100 transition-all hover:scale-105 transform">
            Claim Offer
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile CTA */}
        <button className="sm:hidden flex items-center gap-1 bg-white text-purple-600 px-3 py-1.5 rounded-full font-semibold text-xs hover:bg-gray-100 transition-all flex-shrink-0">
          Claim
          <ArrowRight className="w-3 h-3" />
        </button>

        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="flex-shrink-0 p-1 hover:bg-white/20 rounded-full transition-all"
          aria-label="Close banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PromoBanner;
