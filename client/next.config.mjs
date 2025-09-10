/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors. Only use if you know what you're doing.
    ignoreBuildErrors: false,
  },
  experimental: {
    // Enable experimental features if needed
    typedRoutes: true,
  },
  // Enable strict mode for better development experience
  reactStrictMode: true,
  // Optimize images
  images: {
    domains: ["localhost", "res.cloudinary.com"],
  },
};

export default nextConfig;
