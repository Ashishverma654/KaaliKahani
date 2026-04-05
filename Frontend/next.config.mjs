import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [],
  turbopack: {
    // Only apply turbopack root locally to avoid Vercel build-root conflicts map
    root: process.env.NODE_ENV === 'development' ? path.resolve('.') : undefined,
  },
};

export default nextConfig;
