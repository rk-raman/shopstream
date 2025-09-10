"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spotlight } from "@/components/aceternity/spotlight";
import { BackgroundBeams } from "@/components/aceternity/background-beams";
import { Button as MovingBorderButton } from "@/components/aceternity/moving-border";
import { ShoppingCart, Star, Heart } from "lucide-react";

export default function ExamplePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Spotlight */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black/[0.96]">
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="white"
        />
        <div className="relative z-10 text-center text-white">
          <h1 className="text-4xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
            ShopStream
          </h1>
          <p className="mt-4 text-lg md:text-xl text-neutral-300 max-w-lg mx-auto">
            The future of e-commerce with beautiful, modern components
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <MovingBorderButton
              borderRadius="1.75rem"
              className="bg-white dark:bg-slate-900 text-black dark:text-white border-neutral-200 dark:border-slate-800"
            >
              Get Started
            </MovingBorderButton>
            <Button
              variant="outline"
              size="lg"
              className="text-white border-white hover:bg-white hover:text-black"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gradient">
            Beautiful Components
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Built with shadcn/ui and Aceternity UI for the best developer
            experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Product Card Example */}
          <Card className="card-hover">
            <CardHeader>
              <div className="w-full h-48 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg mb-4"></div>
              <CardTitle className="flex items-center justify-between">
                Premium Headphones
                <Heart className="w-5 h-5 text-muted-foreground hover:text-red-500 cursor-pointer" />
              </CardTitle>
              <CardDescription>
                High-quality wireless headphones with noise cancellation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">
                    (128)
                  </span>
                </div>
                <span className="text-2xl font-bold">$299</span>
              </div>
              <Button className="w-full mt-4" size="lg">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            </CardContent>
          </Card>

          {/* Feature Card 1 */}
          <Card className="card-hover glass-morphism">
            <CardHeader>
              <CardTitle>Fast Performance</CardTitle>
              <CardDescription>
                Built with Next.js 15 and optimized for speed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Loading Speed</span>
                  <span className="font-semibold">98%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full w-[98%]"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature Card 2 */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Modern Design</CardTitle>
              <CardDescription>
                Beautiful components with smooth animations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="default" className="w-full">
                  Default Button
                </Button>
                <Button variant="outline" className="w-full">
                  Outline Button
                </Button>
                <Button variant="ghost" className="w-full">
                  Ghost Button
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Background Beams Section */}
      <section className="relative py-20 overflow-hidden">
        <BackgroundBeams />
        <div className="relative z-10 text-center text-white">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">
            Ready to Build?
          </h2>
          <p className="text-lg text-neutral-300 max-w-2xl mx-auto mb-8">
            Start building your e-commerce platform with our beautiful
            components
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-white text-black hover:bg-gray-100">
              Start Building
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-white border-white hover:bg-white hover:text-black"
            >
              View Docs
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
