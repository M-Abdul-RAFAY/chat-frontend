import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true, // ✅ This skips ESLint checks during `next build`
  },
};

export default nextConfig;
