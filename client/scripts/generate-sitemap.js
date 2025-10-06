const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://innvibs.com';

// Static pages that exist in your Next.js app
const staticPages = [
  '',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/search',
];

// You can dynamically fetch these from your API
const dynamicPages = [
  // Add your blog posts, categories, tags here
  // Example: '/category/lifestyle', '/category/technology', etc.
];

async function generateSitemap() {
  const currentDate = new Date().toISOString();

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(page => `  <url>
    <loc>${BASE_URL}${page}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}

  ${dynamicPages.map(page => `  <url>
    <loc>${BASE_URL}${page}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), sitemap);
  console.log('Sitemap generated successfully!');
}

generateSitemap().catch(console.error);