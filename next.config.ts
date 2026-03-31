import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    proxyClientMaxBodySize: "50mb",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
}

export default nextConfig
