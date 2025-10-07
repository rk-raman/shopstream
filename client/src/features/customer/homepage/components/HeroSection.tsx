import React, { useState, useEffect } from "react";

interface Slide {
  id: number;
  image: string;
  link: string;
  alt: string;
}

const HeroSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);

  const slides: Slide[] = [
    {
      id: 1,
      image:
        "https://rukminim2.flixcart.com/fk-p-flap/3240/540/image/3505234af9fee5b0.jpg?q=60",
      link: "/collections/summer-sale",
      alt: "Summer Sale - Up to 70% Off",
    },
    {
      id: 2,
      image:
        "https://rukminim2.flixcart.com/fk-p-flap/3240/540/image/c7ecf924f7dda613.jpeg?q=60",
      link: "/collections/new-arrivals",
      alt: "New Arrivals - Fresh Collections",
    },
    {
      id: 3,
      image:
        "https://rukminim2.flixcart.com/fk-p-flap/3240/540/image/3d1705990c27075f.jpeg?q=60",
      link: "/products/electronics",
      alt: "Electronics Deal - Best Prices",
    },
    {
      id: 4,
      image:
        "https://rukminim2.flixcart.com/fk-p-flap/3240/540/image/e5bf357b38305fb3.jpg?q=60",
      link: "/collections/fashion-week",
      alt: "Fashion Week - Style Redefined",
    },
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const goToSlide = (index: number): void => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 7000);
  };

  const nextSlide = (): void => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 7000);
  };

  const prevSlide = (): void => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 7000);
  };

  const handleBannerClick = (link: string): void => {
    // For Next.js, you would use: router.push(link)
    // For now, using window.location for demonstration
    console.log("Navigating to:", link);
    // window.location.href = link;
    alert(`Redirecting to: ${link}`);
  };

  return (
    <div className="relative w-full bg-gray-100">
      {/* Main Slider Container */}
      <div className="relative w-full h-[300px] overflow-hidden">
        {/* Slides */}
        <div
          className="flex transition-transform duration-500 ease-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="min-w-full h-full relative cursor-pointer group"
              onClick={() => handleBannerClick(slide.link)}
            >
              <img
                src={slide.image}
                alt={slide.alt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 md:p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-20 group opacity-0 hover:opacity-100 md:opacity-100"
          aria-label="Previous slide"
        >
          <svg
            className="w-5 h-5 md:w-6 md:h-6 transform group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 md:p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-20 group opacity-0 hover:opacity-100 md:opacity-100"
          aria-label="Next slide"
        >
          <svg
            className="w-5 h-5 md:w-6 md:h-6 transform group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Dots Navigation */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 md:space-x-3 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                goToSlide(index);
              }}
              className={`transition-all duration-300 ${
                currentSlide === index
                  ? "bg-white w-6 md:w-8 h-2 md:h-3 rounded-full"
                  : "bg-white/60 hover:bg-white/80 w-2 md:w-3 h-2 md:h-3 rounded-full"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
