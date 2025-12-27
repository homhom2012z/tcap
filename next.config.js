/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize bundle size
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Enable SWC minification for better performance
  swcMinify: true,

  // Optimize images
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

module.exports = nextConfig;
