/** @type {import('next').NextConfig} */

// Pick API origin from environment only (Preview/Prod set in Vercel).
// We *intentionally* do NOT hardcode a fallback to avoid hitting the wrong API.
const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_ORIGIN) {
  // Fail fast if the env var is missing in any environment
  throw new Error(
    'Missing NEXT_PUBLIC_API_BASE (or NEXT_PUBLIC_API_BASE_URL). Set it in Vercel envs.'
  );
}

const apiBase = API_ORIGIN.replace(/\/$/, ''); // trim trailing slash once

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
    return [
      // Proxy frontend /api → your backend API (Preview uses .in, Prod uses .com)
      { source: '/api/:path*', destination: `${apiBase}/api/:path*` },
    ];
  },

  // Remove the category redirect while verifying SEO (it can get cached).
  // You can re-add later if you really want only one URL form.
  async redirects() {
    return [];
    // If you re-enable later, prefer a temporary redirect during testing:
    // return [{ source: '/category/:slug*', destination: '/:slug*', permanent: false }];
  },

  async headers() {
    return [
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
