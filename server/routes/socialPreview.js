// server/routes/socialPreview.js - FINAL VERSION

const path = require('path');
const fs = require('fs');
const { getBlogBySlugHelper } = require('../controllers/blogController');

// This function is perfect, no changes needed
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
    
    // **** THIS IS THE ONLY CHANGE ****
    // We removed the "isCrawler" check to make it work for everyone.
    if (isBlogRoute) {
        try {
            const slug = req.path.substring('/blog/'.length);
            if (!slug) return next();
            
            const blog = await getBlogBySlugHelper(slug);
            if (!blog) {
                return next();
            }
            
            const htmlPath = path.join(__dirname, '../client/build/index.html');
            const html = fs.readFileSync(htmlPath, 'utf8');
            const metaTags = generateMetaTags(blog);
            const modifiedHtml = html.replace('</head>', `${metaTags}</head>`);
            
            return res.send(modifiedHtml);

        } catch (error) {
            console.error('Error in social preview middleware:', error);
            return next();
        }
    }

    // If it's not a blog route, just continue to the next middleware
    return next();
};

module.exports = socialPreviewMiddleware;