/** @type {import('next').NextConfig} */
const isDevelopment = process.env.NODE_ENV === 'development';

const nextConfig = {
  // Image optimization (single, consolidated block)
  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  compress: true,
  swcMinify: true,
  experimental: {
    optimizeCss: true,
  },

  async rewrites() {
    // Proxy your backend API locally vs prod
    const backendUrl = isDevelopment
      ? 'http://localhost:8081/api/:path*'      // local dev
      : 'https://api.innvibs.in/api/:path*';   // prod (change to .com if needed)

    return [
      {
        source: '/api/:path*',
        destination: backendUrl,
      },
    ];
  },

  async redirects() {
    return [
      // SEO: legacy /category/... to clean /... (doesn't interfere with middleware rewrites)
      {
        source: '/category/:slug*',
        destination: '/:slug*',
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      // CORS headers for your proxied API (optional: keep if you rely on it)
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
      // Security headers site-wide
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
