import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@medchain/api-contract",
    "@medchain/domain",
    "@medchain/ui-tokens",
  ],
};

export default nextConfig;
