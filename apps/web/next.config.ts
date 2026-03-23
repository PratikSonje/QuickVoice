import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d35j3mps666d98.cloudfront.net",
      },
    ],
  },
};

export default nextConfig;
