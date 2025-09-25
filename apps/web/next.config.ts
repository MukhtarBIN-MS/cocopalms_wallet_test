import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',

  // ✅ Don’t fail the build on ESLint
  eslint: { ignoreDuringBuilds: true },

  // ✅ Don’t fail the build on TS errors (we still compile, just don’t block)
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
