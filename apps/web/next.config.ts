import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@medchain/api-contract",
    "@medchain/domain",
    "@medchain/ui-tokens",
  ],
};

export default withSentryConfig(nextConfig, {
  silent: !process.env.CI,
  disableLogger: true,
});
