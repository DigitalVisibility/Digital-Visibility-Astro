/** @type {import('next').NextConfig} */
const nextConfig = {
  // Simple development configuration - no static export
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    typedRoutes: true,
  },
}

module.exports = nextConfig 