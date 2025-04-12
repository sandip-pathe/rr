// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // Required for SSR on Netlify
  distDir: ".next", // Default, optional to specify
  eslint: {
    ignoreDuringBuilds: true, // Optional: good for fast deploys
  },
  typescript: {
    ignoreBuildErrors: true, // ⚠️ Only use in dev if you're fixing TS later
  },
};

export default nextConfig;
