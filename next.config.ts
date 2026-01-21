import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },

  ...(isProd
    ? {
        basePath: "/angora",
        assetPrefix: "/angora",
      }
    : {}),

  allowedDevOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ],
};

export default nextConfig;
