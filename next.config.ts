import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "mammoth"],
  // Turbopack is now the default. We can leave it empty or configure it if needed.
  // Many server-side packages work fine without custom webpack config in the App Router.
};

export default nextConfig;
