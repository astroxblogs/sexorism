/** @type {import('next').NextConfig} */
const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_API_BASE_URL || // keep compat
  'https://api.innvibs.com'; // final fallback (prod)

const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compress: true,
  swcMinify: true,
  experimental: { optimizeCss: true },

  async rewrites() {
    const base = API_ORIGIN.replace(/\/$/, '');
    return [
      { source: '/api/:path*', destination: `${base}/api/:path*` },
    ];
  },

  async redirects() {
    return [
      { source: '/category/:slug*', destination: '/:slug*', permanent: true },
    ];
  },

  async headers() {
    return [
      // You generally don't need CORS when proxying through Next,
      // but harmless to keep if you rely on it.
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
