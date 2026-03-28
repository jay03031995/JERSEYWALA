import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        protocol: 'https',
        hostname: 'scores.iplt20.com',
      },
      {
        protocol: 'https',
        hostname: 'documents.iplt20.com',
      },
      {
        protocol: 'https',
        hostname: 'footballmonk.in',
      },
    ],
  },
};

export default nextConfig;
