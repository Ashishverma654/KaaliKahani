/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [],
  // Removed manual Turbopack root override to prevent watching loops in development map
};

export default nextConfig;
