const path = require('path');
const fs = require('fs');
const { getBlogBySlugHelper } = require('../controllers/blogController');

function generateMetaTags(blog) {
    let description = '';
    if (blog.content) {
        description = blog.content
            .replace(/[#*`\[\]]/g, '') // Remove markdown
            .replace(/\n/g, ' ') // Replace newlines
            .replace(/"/g, '&quot;') // Escape quotes for HTML
            .substring(0, 200)
            .trim();
    }

    if (description.length < 100) {
        description = `${description} Discover innovative ideas, cutting-edge technology insights, and breakthrough concepts at Innvibs. Join thousands of innovators exploring the future of technology and innovation.`.substring(0, 250);
    }
    description += '...';

    const title = `${blog.title.replace(/"/g, '&quot;')} - Innvibs | Innovation & Ideas Hub`;
    const image = blog.image && blog.image.trim() !== '' ?
        blog.image.trim() :
        'https://www.innvibs.com/assets/default-blog-og.jpg';
    const url = `https://www.innvibs.com/blog/${blog.slug}`;

    return `
        <title>${title}</title>
        <meta name="description" content="${description}" />
        <meta name="keywords" content="${blog.tags ? blog.tags.join(', ') + ', innvibs, innovation, technology' : 'innvibs, innovation, technology, ideas'}" />
        <meta name="author" content="Innvibs Team" />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Innvibs" />
        <meta property="og:title" content="${title}" />
        <meta property="og:description" content="${description}" />
        <meta property="og:image" content="${image}" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:secure_url" content="${image}" />
        <meta property="og:url" content="${url}" />
        <meta property="og:locale" content="en_US" />
        <meta property="article:published_time" content="${blog.date}" />
        <meta property="article:author" content="Innvibs Team" />
        <meta property="article:section" content="${blog.category || 'Technology'}" />
        ${blog.tags ? blog.tags.map(tag => `<meta property="article:tag" content="${tag}" />`).join('\n        ') : ''}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@innvibs" />
        <meta name="twitter:creator" content="@innvibs" />
        <meta name="twitter:title" content="${title}" />
        <meta name="twitter:description" content="${description}" />
        <meta name="twitter:image" content="${image}" />
        <meta name="twitter:image:alt" content="${blog.title.replace(/"/g, '&quot;')}" />
        <link rel="canonical" href="${url}" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
        <script type="application/ld+json">{ "@context": "https://schema.org", "@type": "BlogPosting", "headline": "${blog.title.replace(/"/g, '\\"')}", "description": "${description.replace(/"/g, '\\"')}", "image": { "@type": "ImageObject", "url": "${image}", "width": 1200, "height": 630 }, "author": { "@type": "Organization", "name": "Innvibs", "url": "https://www.innvibs.com" }, "publisher": { "@type": "Organization", "name": "Innvibs", "url": "https://www.innvibs.com", "logo": { "@type": "ImageObject", "url": "https://www.innvibs.com/assets/logo.png", "width": 200, "height": 200 } }, "datePublished": "${blog.date}", "dateModified": "${blog.updatedAt || blog.date}", "mainEntityOfPage": { "@type": "WebPage", "@id": "${url}" }, "keywords": "${blog.tags ? blog.tags.join(', ') : 'innovation, technology'}", "articleSection": "${blog.category || 'Technology'}", "url": "${url}" }</script>
    `;
}

const socialPreviewMiddleware = async (req, res, next) => {
    const isBlogRoute = req.path.startsWith('/blog/');

    if (isBlogRoute) {
        console.log(`[PREVIEW] Intercepted blog route: ${req.path}`);
        try {
            let slug = req.path.substring('/blog/'.length).split('?')[0];

            if (!slug) {
                console.log('[PREVIEW] No slug found, passing to next middleware.');
                return next();
            }

            // ✅ Normalize slug (remove trailing slash + lowercase)
            slug = slug.replace(/\/+$/, '').toLowerCase();
            console.log(`[PREVIEW] Normalized slug: "${slug}". Fetching from database...`);

            const blog = await getBlogBySlugHelper(slug);

            if (!blog) {
                console.log(`[PREVIEW] Blog with slug "${slug}" not found in database. Passing to next middleware.`);
                return next();
            }

            console.log(`[PREVIEW] Successfully fetched blog: "${blog.title}". Generating meta tags.`);

            const htmlPath = path.join(__dirname, '..', 'client/build/index.html');
            const html = fs.readFileSync(htmlPath, 'utf8');
            const metaTags = generateMetaTags(blog);
            const modifiedHtml = html.replace('</head>', `${metaTags}</head>`);

            console.log('[PREVIEW] Sending modified HTML to crawler.');
            return res.send(modifiedHtml);

        } catch (error) {
            console.error('[PREVIEW] CRITICAL ERROR in social preview middleware:', error);
            return next();
        }
    }

    return next();
};

module.exports = socialPreviewMiddleware;
