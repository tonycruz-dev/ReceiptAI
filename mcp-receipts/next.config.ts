import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@modelcontextprotocol/client",
    "@cfworker/json-schema",
  ],
};

export default nextConfig;
