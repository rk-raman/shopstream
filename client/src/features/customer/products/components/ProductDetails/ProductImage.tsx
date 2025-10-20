"use client";
import { useState } from "react";
import Image from "next/image";

export default function ProductImage({ images }: { images: string[] }) {
  const [selectedImage, setSelectedImage] = useState(0);
  console.log("images", images);

  return (
    <div className="space-y-4">
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
        <Image
          src={images[selectedImage]?.url}
          alt="Product"
          width={500}
          height={500}
          className="w-full h-full object-cover"
          priority
        />
      </div>
      <div className="flex gap-2">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedImage(idx)}
            className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
              selectedImage === idx ? "border-blue-500" : "border-gray-200"
            }`}
          >
            <Image
              src={img?.url}
              alt={`Thumbnail ${idx}`}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
