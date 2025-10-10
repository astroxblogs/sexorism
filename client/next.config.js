/** @type {import('next').NextConfig} */

// Use env var when provided; otherwise in *development* default to testing API.
// In production, require the env var (so you don't accidentally hit the wrong API).
const resolvedApiOrigin =
  process.env.NEXT_PUBLIC_API_BASE ||
  (process.env.NODE_ENV !== 'production' ? 'https://api.innvibs.in' : '');

if (!resolvedApiOrigin) {
  throw new Error(
    'Missing NEXT_PUBLIC_API_BASE in production. Set it to https://api.innvibs.com (prod) or https://api.innvibs.in (preview).'
  );
}

const apiBase = resolvedApiOrigin.replace(/\/$/, '');

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
    // Proxy /api → your backend (localhost uses testing API by default)
    return [{ source: '/api/:path*', destination: `${apiBase}/api/:path*` }];
  },

  async redirects() {
    // Keep empty while verifying SEO; you already added app/[categoryName]/page.tsx
    return [];
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
