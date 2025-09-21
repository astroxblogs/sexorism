const Blog = require('../models/Blog');
const BlogViewLog = require('../models/BlogViewLog');  // ✅ new name
// ✅ only here

// Helper function to generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')         // Spaces → hyphens
    .replace(/-+/g, '-')          // Multiple hyphens → single
    .replace(/^-+|-+$/g, '');     // Trim leading/trailing hyphens
};

// ===============================
// HELPER FUNCTION for Social Media Previews
// ===============================
const getBlogBySlugHelper = async (slug) => {
  try {
    if (!slug) return null;

    // 🔹 Normalize slug: remove trailing slash + lowercase
    const normalizedSlug = slug.replace(/\/+$/, '').toLowerCase();

    console.log('🔍 Fetching blog by slug for social preview:', normalizedSlug);

    const blog = await Blog.findOne({
      slug: normalizedSlug,
      status: 'published'   // ✅ Only published blogs show in previews
    })
      .lean()
      .select(
        'title title_en title_hi content content_en content_hi image date category tags slug views comments likes shareCount updatedAt'
      );

    if (blog) {
      console.log('✅ Blog found for social preview:', blog.title);
      return blog;
    } else {
      console.log('❌ No blog found with slug:', normalizedSlug);
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching blog by slug for social preview:', error);
    return null; // 🔹 safer than throwing → won’t crash middleware
  }
};


// ===============================
// Get all blogs (homepage, with pagination + filters)
// ===============================
const getBlogs = async (req, res) => {
  try {
    const { category, tag, page = 1, limit = 10, excludeCategory } = req.query;
    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);

    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      return res.status(400).json({ error: 'Invalid limit parameter.' });
    }
    if (isNaN(parsedPage) || parsedPage <= 0) {
      return res.status(400).json({ error: 'Invalid page parameter.' });
    }

    let filter = {};
    if (category && category.toLowerCase() !== 'all') {
      filter.category = category.trim();
    }
    if (excludeCategory) {
      filter.category = { $ne: excludeCategory.trim() };
    }
    if (tag) {
      filter.tags = { $in: [new RegExp(`^${tag.trim()}$`, 'i')] };
    }

    const skip = (parsedPage - 1) * parsedLimit;

    // Show only published blogs (missing status → treat as published)
    const publicFilter = {
      ...filter,
      $or: [{ status: 'published' }, { status: { $exists: false } }]
    };

    const blogs = await Blog.find(publicFilter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .select(
        'title title_en title_hi content content_en content_hi image date category tags slug views comments likes shareCount'
      );

    const totalBlogs = await Blog.countDocuments(publicFilter);
    const totalPages = Math.ceil(totalBlogs / parsedLimit);

    res.json({ blogs, currentPage: parsedPage, totalPages, totalBlogs });
  } catch (err) {
    console.error('Error in getBlogs:', err);
    res.status(500).json({ error: err.message || 'Failed to retrieve blogs.' });
  }
};

// ===============================
// Latest 5 blogs (carousel)
// ===============================
const getLatestBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({
      $or: [{ status: 'published' }, { status: { $exists: false } }]
    })
      .sort({ date: -1 })
      .limit(5)
      .select(
        'title title_en title_hi content content_en content_hi image date category tags slug views comments likes shareCount'
      );

    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===============================
// Search blogs
// ===============================
const searchBlogs = async (req, res) => {
  const { q, page = 1, limit = 10 } = req.query;
  const parsedLimit = parseInt(limit, 10);
  const parsedPage = parseInt(page, 10);

  if (isNaN(parsedLimit) || parsedLimit <= 0 || isNaN(parsedPage) || parsedPage <= 0 || !q) {
    return res.status(400).json({ error: 'Invalid parameters or missing search query.' });
  }

  try {
    const regex = new RegExp(q, 'i');
    const searchFilter = {
      $or: [
        { title: regex },
        { content: regex },
        { title_en: regex },
        { title_hi: regex },
        { content_en: regex },
        { content_hi: regex },
        { tags: regex },
        { category: regex }
      ],
      $or: [{ status: 'published' }, { status: { $exists: false } }]
    };

    const skip = (parsedPage - 1) * parsedLimit;

    const blogs = await Blog.find(searchFilter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .select(
        'title title_en title_hi content content_en content_hi image date category tags slug views comments likes shareCount'
      );

    const totalBlogs = await Blog.countDocuments(searchFilter);
    const totalPages = Math.ceil(totalBlogs / parsedLimit);

    res.json({ blogs, currentPage: parsedPage, totalPages, totalBlogs });
  } catch (err) {
    console.error('Error in searchBlogs:', err);
    res.status(500).json({ error: 'Failed to perform search.' });
  }
};

// ===============================
// Get single blog by ID
// ===============================
const getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('comments')
      .select(
        'title title_en title_hi content content_en content_hi image date category tags slug views comments likes shareCount'
      );

    if (!blog) return res.status(404).json({ error: 'Blog not found' });

    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===============================
// Get single blog by slug (API ENDPOINT)
// ===============================
const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({
      slug: req.params.slug,
      $or: [{ status: 'published' }, { status: { $exists: false } }]
    })
      .populate('comments')
      .select(
        'title title_en title_hi content content_en content_hi image date category tags slug views comments likes shareCount'
      );

    if (!blog) return res.status(404).json({ error: 'Blog not found' });

    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===============================
// Increment views
// ===============================
const incrementViews = async (req, res) => {
  try {
    const { id } = req.params;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // **** THIS IS THE FIXED LINE ****
    // It now safely handles cases where req.body is empty or undefined.
    const { skipLog = false } = req.body || {};

    if (!skipLog) {
      // Check if this IP already viewed this blog recently
      const existingLog = await BlogViewLog.findOne({ blogId: id, ip });

      if (existingLog) {
       // difference in seconds instead of hours
const secondsSinceLastView = (Date.now() - existingLog.lastViewed.getTime()) / 1000;

if (secondsSinceLastView < 10) {
  return res.json({ message: 'View already counted recently', skip: true });
}

        // Update last viewed timestamp
        existingLog.lastViewed = new Date();
        await existingLog.save();
      } else {
        // First time this IP viewed this blog
        await BlogViewLog.create({ blogId: id, ip });
      }
    }

    // Increment actual blog views
    const updated = await Blog.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Blog not found' });

    res.json({ views: updated.views });
  } catch (err) {
    console.error('Error in incrementViews:', err);
    res.status(500).json({ error: err.message });
  }
};

// ===============================
// Increment share count
// ===============================
const incrementShares = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Blog.findByIdAndUpdate(id, { $inc: { shareCount: 1 } }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Blog not found' });
    res.json({ shareCount: updated.shareCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===============================
// Likes
// ===============================
const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) return res.status(404).json({ message: 'Blog not found.' });

    blog.likes = (blog.likes || 0) + 1;
    await blog.save();

    res.status(200).json({ message: 'Post liked successfully!', likes: blog.likes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to like the post.' });
  }
};

const unlikePost = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) return res.status(404).json({ message: 'Blog not found.' });

    blog.likes = Math.max((blog.likes || 0) - 1, 0);
    await blog.save();

    res.status(200).json({ message: 'Post unliked successfully!', likes: blog.likes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unlike the post.' });
  }
};

// ===============================
// Comments
// ===============================
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, comment } = req.body;

    if (!name || !comment) {
      return res.status(400).json({ message: 'Name and comment are required.' });
    }

    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ message: 'Blog not found.' });

    const newComment = { name, comment, timestamp: new Date() };
    blog.comments.push(newComment);
    await blog.save();

    res.status(201).json({ message: 'Comment added successfully!', comment: newComment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add the comment.' });
  }
};

// ===============================
// Social Media Preview Function
// ===============================
const getSocialMediaPreview = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).send(generateSocialPreviewHTML(null, 'Invalid blog slug'));
    }

    // Use the existing helper function to get blog data
    const blog = await getBlogBySlugHelper(slug);

    if (!blog) {
      return res.status(404).send(generateSocialPreviewHTML(null, 'Blog not found'));
    }

    // Check if request is from social media crawler
    const userAgent = req.get('User-Agent') || '';
    const isSocialCrawler = /facebookexternalhit|Twitterbot|LinkedInBot|WhatsApp|TelegramBot/i.test(userAgent);

    if (isSocialCrawler) {
      // Serve social media preview HTML for crawlers
      const html = generateSocialPreviewHTML(blog);
      res.set('Content-Type', 'text/html');
      res.send(html);
    } else {
      // For regular users, redirect to frontend blog detail page
      const frontendUrl = process.env.NODE_ENV === 'production'
        ? process.env.CORS_ORIGIN_PROD || 'https://www.innvibs.com'
        : 'http://localhost:3000';
      res.redirect(`${frontendUrl}/blog-detail/${slug}`);
    }

  } catch (error) {
    console.error('Error generating social media preview:', error);
    res.status(500).send(generateSocialPreviewHTML(null, 'Internal server error'));
  }
};

// ===============================
// HTML Template Generator for Social Media Previews
// ===============================
const generateSocialPreviewHTML = (blog, errorMessage = null) => {
  const baseUrl = process.env.NODE_ENV === 'production'
    ? process.env.CORS_ORIGIN_PROD || 'https://www.innvibs.com'
    : 'http://localhost:8081'; // Use backend URL for social previews

  if (errorMessage || !blog) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${errorMessage || 'Blog Not Found'} - InnVibs</title>

        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:title" content="${errorMessage || 'Blog Not Found'}">
        <meta property="og:description" content="Visit InnVibs for the latest blogs and insights">
        <meta property="og:image" content="${baseUrl}/logo.png">
        <meta property="og:url" content="${baseUrl}">
        <meta property="og:site_name" content="InnVibs">

        <!-- Twitter -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${errorMessage || 'Blog Not Found'}">
        <meta name="twitter:description" content="Visit InnVibs for the latest blogs and insights">
        <meta name="twitter:image" content="${baseUrl}/logo.png">
      </head>
      <body>
        <h1>${errorMessage || 'Blog Not Found'}</h1>
        <p><a href="${baseUrl}">Visit InnVibs</a></p>
      </body>
      </html>
    `;
  }

  // Get the best available title (English, Hindi, or default)
  const title = blog.title_en || blog.title_hi || blog.title;

  // Get the best available content and create description (first 160 chars)
  const content = blog.content_en || blog.content_hi || blog.content;
  const description = content
    ? content.replace(/<[^>]*>/g, '').substring(0, 160) + (content.length > 160 ? '...' : '')
    : 'Read this amazing blog post on InnVibs';

  // Optimize image URL for social media (1200x630)
  let imageUrl = blog.image;
  if (imageUrl && imageUrl.includes('cloudinary.com')) {
    // Transform Cloudinary URL for social media optimization
    imageUrl = imageUrl.replace('/upload/', '/upload/w_1200,h_630,c_fill,q_auto,f_auto/');
  } else if (imageUrl) {
    // Fallback for non-Cloudinary images
    imageUrl = imageUrl;
  } else {
    // Default image if no blog image
    imageUrl = `${baseUrl}/logo.png`;
  }

  const blogUrl = `${baseUrl}/blog-detail/${blog.slug}`;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - InnVibs</title>

      <!-- Open Graph / Facebook -->
      <meta property="og:type" content="article">
      <meta property="og:title" content="${title}">
      <meta property="og:description" content="${description}">
      <meta property="og:image" content="${imageUrl}">
      <meta property="og:url" content="${blogUrl}">
      <meta property="og:site_name" content="InnVibs">
      <meta property="article:published_time" content="${blog.date.toISOString()}">
      <meta property="article:modified_time" content="${blog.updatedAt.toISOString()}">
      ${blog.category ? `<meta property="article:section" content="${blog.category}">` : ''}
      ${blog.tags ? blog.tags.map(tag => `<meta property="article:tag" content="${tag}">`).join('\n      ') : ''}

      <!-- Twitter -->
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:title" content="${title}">
      <meta name="twitter:description" content="${description}">
      <meta name="twitter:image" content="${imageUrl}">

      <!-- Additional SEO -->
      <meta name="description" content="${description}">
      <link rel="canonical" href="${blogUrl}">
    </head>
    <body>
      <article>
        <h1>${title}</h1>
        <p><strong>Category:</strong> ${blog.category}</p>
        <p><strong>Published:</strong> ${new Date(blog.date).toLocaleDateString()}</p>
        ${blog.tags && blog.tags.length > 0 ? `<p><strong>Tags:</strong> ${blog.tags.join(', ')}</p>` : ''}
        <div>
          ${content ? content.substring(0, 500) + (content.length > 500 ? '...' : '') : 'No preview available'}
        </div>
        <p><a href="${blogUrl}">Read full article on InnVibs</a></p>
      </article>
    </body>
    </html>
  `;
};

// ===============================
// Export
// ===============================
module.exports = {
  getBlogs,
  getLatestBlogs,
  searchBlogs,
  getBlog,
  getBlogBySlug,
  getBlogBySlugHelper, // NEW: Helper function for social media previews
  getSocialMediaPreview, // NEW: Social media preview function
  incrementViews,
  incrementShares,
  likePost,
  unlikePost,
  addComment
};