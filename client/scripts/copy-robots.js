/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.innvibs.com';
const isProd = /innvibs\.com$/i.test(site);

const robotsProd = `User-agent: *
Allow: /
Sitemap: ${site.replace(/\/$/, '')}/sitemap.xml
`;

const robotsDev = `User-agent: *
Disallow: /
# (Dev environment; block indexing)
`;

const out = path.join(__dirname, '../public/robots.txt');
fs.writeFileSync(out, isProd ? robotsProd : robotsDev, 'utf8');
console.log('[robots] wrote', isProd ? 'prod robots.txt' : 'dev robots.txt', 'to', out);
