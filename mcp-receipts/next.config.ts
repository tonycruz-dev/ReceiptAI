import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "@modelcontextprotocol/client",
      "@cfworker/json-schema",
    ],
  },
};

export default nextConfig;
