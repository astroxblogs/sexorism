/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

// ------------------------------------------------------------------
// Config (host-aware, clean URLs, pulls data from your API)
// ------------------------------------------------------------------
const SITE_BASE =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITEMAP_BASE_URL ||
  'https://www.innvibs.com';

const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE || 'https://api.innvibs.in').replace(/\/$/, '');

// Static pages in your app
const staticPages = ['', '/about', '/contact', '/privacy', '/terms', '/search'];

// How many recent posts to include (adjust as you like)
const BLOG_LIMIT = Number(process.env.SITEMAP_BLOG_LIMIT || 100);

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
const slugifyCategory = (text) =>
  String(text || '')
    .toLowerCase()
    .replace(/\s*&\s*/g, '-and-')   // Health & Wellness → health-and-wellness
    .replace(/\s+/g, '-')           // spaces -> hyphen
    .replace(/[^a-z0-9-]/g, '')     // only url-safe
    .replace(/-+/g, '-')            // collapse hyphens
    .replace(/^-+|-+$/g, '');       // trim

async function getJson(url) {
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} for ${url}`);
  const data = await res.json();
  return data?.payload?.data ?? data?.data ?? data;
}

async function fetchCategories() {
  try {
    const list = await getJson(`${API_BASE}/api/categories`);
    const items = Array.isArray(list) ? list : list?.categories || [];
    // Prefer slug; fall back to name fields, then slugify

     return items.map((c) =>
      slugifyCategory(c.slug || c.name_en || c.name_hi || c.name || 'category')
    );

  } catch (e) {
    console.warn('[sitemap] categories fetch failed:', e.message);
    return [];
  }
}

async function fetchBlogs(limit) {
  try {
    const resp = await getJson(`${API_BASE}/api/blogs?limit=${limit}`);
    const blogs = Array.isArray(resp?.blogs) ? resp.blogs : Array.isArray(resp) ? resp : [];
    return blogs.map((b) => ({
      categorySlug: slugifyCategory(b.category || 'uncategorized'),
      blogSlug: b.slug || b._id || '',
      updatedAt: b.updatedAt || b.date || b.createdAt || new Date().toISOString(),
    }));
  } catch (e) {
    console.warn('[sitemap] blogs fetch failed:', e.message);
    return [];
  }
}

function urlEntry(loc, lastmod, changefreq, priority) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

// ------------------------------------------------------------------
// Main
// ------------------------------------------------------------------
async function generateSitemap() {
  const [categories, blogs] = await Promise.all([
    fetchCategories(),
    fetchBlogs(BLOG_LIMIT),
  ]);

  const nowIso = new Date().toISOString();

  const staticXml = staticPages
    .map((page) =>
      urlEntry(
        `${SITE_BASE}${page}`,
        nowIso,
        'weekly',
        page === '' ? '1.0' : '0.8'
      )
    )
    .join('\n');

const hiHomeXml = urlEntry(`${SITE_BASE}/hi`, nowIso, 'weekly', '1.0');

  // Category listing pages: /{categorySlug}
  const categoryXml = categories
    .map((cat) => urlEntry(`${SITE_BASE}/${cat}`, nowIso, 'weekly', '0.7'))
    .join('\n');


  
const categoryHiXml = categories
  .map((cat) => urlEntry(`${SITE_BASE}/hi/${cat}`, nowIso, 'weekly', '0.7'))
  .join('\n');

  // Blog detail pages: /{categorySlug}/{blogSlug}
  const blogXml = blogs
    .filter((b) => b.categorySlug && b.blogSlug)
    .map((b) =>
      urlEntry(
        `${SITE_BASE}/${b.categorySlug}/${b.blogSlug}`,
        new Date(b.updatedAt).toISOString(),
        'monthly',
        '0.6'
      )
    )
    .join('\n');


const blogHiXml = blogs
  .filter((b) => b.categorySlug && b.blogSlug)
  .map((b) =>
    urlEntry(
      `${SITE_BASE}/hi/${b.categorySlug}/${b.blogSlug}`,
      new Date(b.updatedAt).toISOString(),
      'monthly',
      '0.6'
    )
  )
  .join('\n');



// In the sitemap template string, add the 3 new lines where shown
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticXml}
${hiHomeXml}
${categoryXml}
${categoryHiXml}
${blogXml}
${blogHiXml}
</urlset>`;


  const outPath = path.join(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(outPath, sitemap, 'utf8');
  console.log('Sitemap generated successfully at', outPath);
}

generateSitemap().catch((err) => {
  console.error('Sitemap generation failed:', err);
  process.exit(1);
});
