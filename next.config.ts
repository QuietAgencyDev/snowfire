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

  // One address is canonical, and it is the bare one. Serving both would split
  // sessions across hosts and hand search engines two copies of every page,
  // while metadataBase already advertises the apex.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.snowfire.ca" }],
        destination: "https://snowfire.ca/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
