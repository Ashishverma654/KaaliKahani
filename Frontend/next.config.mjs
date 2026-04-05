import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [],
  turbopack: {
    root: path.resolve('.'),
  },
};

export default nextConfig;
