import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Matched to Vercel's hard 4.5 MB request ceiling rather than set above it.
      // A higher number here only moves the rejection from a handled error to a
      // platform 413, and hides the problem until it runs in production.
      bodySizeLimit: "4.5mb",
    },
  },
};

export default nextConfig;
