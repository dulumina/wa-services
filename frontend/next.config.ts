import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use export only in production for unified port serving
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
  // Proxy API requests to backend during development (npm run dev)
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:8000/api/:path*',
        },
        {
          source: '/socket.io/:path*',
          destination: 'http://localhost:8000/socket.io/:path*',
        },
        {
          source: '/api-docs/:path*',
          destination: 'http://localhost:8000/api-docs/:path*',
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
