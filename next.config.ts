import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // When app is served at /app (e.g. app.studiorevy.com/app), set NEXT_PUBLIC_BASE_PATH=/app
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
};

export default nextConfig;
