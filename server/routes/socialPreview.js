// server/routes/socialPreviews.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { getBlogBySlugHelper } = require('../controllers/blogController');

// Function to generate meta tags HTML
function generateMetaTags(blog) {
    // Clean description from markdown and ensure minimum 100 characters for LinkedIn
    let description = '';
    if (blog.content) {
        description = blog.content
            .replace(/[#*`\[\]]/g, '') // Remove markdown
            .replace(/\n/g, ' ') // Replace newlines
            .substring(0, 200)
            .trim();
    }
    
    // Ensure minimum 100 characters for LinkedIn
    if (description.length < 100) {
        description = `${description} Discover innovative ideas, cutting-edge technology insights, and breakthrough concepts at Innvibs. Join thousands of innovators exploring the future of technology and innovation.`.substring(0, 250);
    }
    description += '...';

    const title = `${blog.title} - Innvibs | Innovation & Ideas Hub`;
    const image = blog.image && blog.image.trim() !== '' ? 
        blog.image.trim() : 
        'https://www.innvibs.com/assets/default-blog-og.jpg';
    const url = `https://www.innvibs.com/blog/${blog.slug}`;

    return `
        <title>${title}</title>
        <meta name="description" content="${description}" />
        <meta name="keywords" content="${blog.tags ? blog.tags.join(', ') + ', innvibs, innovation, technology' : 'innvibs, innovation, technology, ideas'}" />
        <meta name="author" content="Innvibs Team" />
        
        <!-- Open Graph / Facebook & LinkedIn -->
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
        
        <!-- Article specific Open Graph -->
        <meta property="article:published_time" content="${blog.date}" />
        <meta property="article:author" content="Innvibs Team" />
        <meta property="article:section" content="${blog.category || 'Technology'}" />
        ${blog.tags ? blog.tags.map(tag => `<meta property="article:tag" content="${tag}" />`).join('\n        ') : ''}
        
        <!-- Twitter Card -->
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@innvibs" />
        <meta name="twitter:creator" content="@innvibs" />
        <meta name="twitter:title" content="${title}" />
        <meta name="twitter:description" content="${description}" />
        <meta name="twitter:image" content="${image}" />
        <meta name="twitter:image:alt" content="${blog.title}" />
        
        <!-- Additional for WhatsApp -->
        <meta property="og:image:alt" content="${blog.title}" />
        
        <!-- Canonical URL -->
        <link rel="canonical" href="${url}" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
        
        <!-- Schema.org structured data for rich snippets -->
        <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": "${blog.title}",
            "description": "${description}",
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

// Blog preview route for social media crawlers
router.get('/blog/:slug', async (req, res) => {
    try {
        const userAgent = req.headers['user-agent'] || '';
        const isCrawler = /facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|slackbot|discordbot|googlebot|bingbot|applebot/i.test(userAgent);
        
        console.log('🔍 Blog Route Hit:', req.params.slug);
        console.log('🤖 User-Agent:', userAgent);
        console.log('🔍 Is Crawler:', isCrawler);
        
        if (isCrawler) {
            // Fetch blog data for social media crawlers
           const blog = await getBlogBySlugHelper(req.params.slug);
            
            if (!blog) {
                console.log('❌ Blog not found:', req.params.slug);
                return res.status(404).send('Blog not found');
            }
            
            console.log('✅ Blog found for crawler:', blog.title);
            
            // Read the built React HTML file
            const htmlPath = path.join(__dirname, '../../client/build/index.html');
            
            if (!fs.existsSync(htmlPath)) {
                console.log('❌ Build file not found:', htmlPath);
                return res.status(500).send('Build file not found. Make sure to run npm run build in client folder.');
            }
            
            let html = fs.readFileSync(htmlPath, 'utf8');
            
            // Generate dynamic meta tags
            const metaTags = generateMetaTags(blog);
            
            // Replace the entire head section with our optimized meta tags
            html = html.replace(
                /<head>[\s\S]*?<\/head>/i,
                `<head>
                    <meta charset="utf-8" />
                    <link rel="icon" href="/favicon.ico" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <meta name="theme-color" content="#6366f1" />
                    ${metaTags}
                </head>`
            );
            
            console.log('✅ Serving crawler-optimized HTML for:', blog.title);
            res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
            res.send(html);
        } else {
            // For regular users, let the main server handle it
            console.log('👤 Regular user - passing to main server');
            return res.status(404).send('Route handled by main server');
        }
    } catch (error) {
        console.error('❌ Error in social preview route:', error);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;