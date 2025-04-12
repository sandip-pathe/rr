// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  distDir: "functions/.next",
  eslint: {
    ignoreDuringBuilds: true, // Skip linting during build
  },
  typescript: {
    ignoreBuildErrors: true, // Skip TypeScript errors during build
  },
};

export default nextConfig;
