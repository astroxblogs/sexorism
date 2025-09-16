// server/routes/socialPreview.js

const path = require('path');
const fs = require('fs');
const { getBlogBySlugHelper } = require('../controllers/blogController');

// This function is excellent, no changes needed here.
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

    // All your meta tags generation logic remains the same...
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
        
        <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": "${blog.title.replace(/"/g, '\\"')}",
            "description": "${description.replace(/"/g, '\\"')}",
            "image": {
                "@type": "ImageObject",
                "url": "${image}",
                "width": 1200,
                "height": 630
            },
            "author": {
                "@type": "Organization",
                "name": "Innvibs",
                "url": "https://www.innvibs.com"
            },
            "publisher": {
                "@type": "Organization",
                "name": "Innvibs",
                "url": "https://www.innvibs.com",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://www.innvibs.com/assets/logo.png",
                    "width": 200,
                    "height": 200
                }
            },
            "datePublished": "${blog.date}",
            "dateModified": "${blog.updatedAt || blog.date}",
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": "${url}"
            },
            "keywords": "${blog.tags ? blog.tags.join(', ') : 'innovation, technology'}",
            "articleSection": "${blog.category || 'Technology'}",
            "url": "${url}"
        }
        </script>
    `;
}

// This is now our main middleware function
const socialPreviewMiddleware = async (req, res, next) => {
    const userAgent = req.headers['user-agent'] || '';
    const isCrawler = /facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|slackbot|discordbot|googlebot|bingbot|applebot/i.test(userAgent);
    const isBlogRoute = req.path.startsWith('/blog/');
    
    // Only proceed if it's a crawler AND it's a blog route
    if (isCrawler && isBlogRoute) {
        try {
            const slug = req.path.substring('/blog/'.length);
            if (!slug) return next(); // Not a valid blog slug URL

            console.log('🤖 Crawler detected for blog slug:', slug);
            
            const blog = await getBlogBySlugHelper(slug);
            if (!blog) {
                console.log('❌ Blog not found for crawler:', slug);
                return next(); // Let the React app handle the 404
            }

            console.log('✅ Serving crawler-optimized HTML for:', blog.title);
            
            const htmlPath = path.join(__dirname, '../client/build/index.html')
            const html = fs.readFileSync(htmlPath, 'utf8');
            const metaTags = generateMetaTags(blog);
            
            // FIX: Inject meta tags BEFORE the closing </head> tag.
            // This preserves existing <link> and <script> tags in the head.
            const modifiedHtml = html.replace('</head>', `${metaTags}</head>`);
            
            res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
            return res.send(modifiedHtml);

        } catch (error) {
            console.error('❌ Error in social preview middleware:', error);
            // In case of error, just pass through to the default handler
            return next();
        }
    }

    // If not a crawler or not a blog route, just let the request continue to the next middleware
    return next();
};

module.exports = socialPreviewMiddleware;