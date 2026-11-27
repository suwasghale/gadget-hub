import type { NextConfig } from "next";

// Product images served by Django itself (local MEDIA_ROOT in development).
const apiUrl = new URL(process.env.API_INTERNAL_URL || "http://127.0.0.1:8000");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https", // Cloudinary and other HTTPS image hosts
        hostname: "**",
      },
      {
        protocol: apiUrl.protocol.replace(":", "") as "http" | "https",
        hostname: apiUrl.hostname,
        port: apiUrl.port,
        pathname: "/media/**",
      },
    ],
  },
};

export default nextConfig;
