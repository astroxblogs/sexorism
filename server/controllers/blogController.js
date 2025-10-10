const Blog = require('../models/Blog');
const BlogViewLog = require('../models/BlogViewLog');
const Category = require('../models/Category');  // ✅ new name
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



// Decide language: ?lang=xx > Accept-Language > 'en'
function getLang(req) {
  const q = (req.query?.lang || '').toString().trim().toLowerCase();
  if (q) return q.split('-')[0];
  const h = (req.headers['accept-language'] || '').toString().trim().toLowerCase();
  if (h) return h.split(',')[0].split('-')[0];
  return 'en';
}

// Apply language to a single Blog document (works with Mongoose docs or plain objects)
function localizeBlog(doc, lang = 'en') {
  if (!doc) return doc;
  const o = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };

  // If you store flat fields like title_hi/content_hi/excerpt_hi
  const suf = lang === 'en' ? '' : `_${lang}`;

  // title
  if (suf && o[`title${suf}`]) o.title = o[`title${suf}`];
  else if (o.title_en && lang === 'en') o.title = o.title_en;

  // excerpt
  if (suf && o[`excerpt${suf}`]) o.excerpt = o[`excerpt${suf}`];
  else if (o.excerpt_en && lang === 'en') o.excerpt = o.excerpt_en;

  // content
  if (suf && o[`content${suf}`]) o.content = o[`content${suf}`];
  else if (o.content_en && lang === 'en') o.content = o.content_en;

  // optional: tags, if you keep localized variants like tags_hi
  if (suf && o[`tags${suf}`]) o.tags = o[`tags${suf}`];

  o.lang = lang; // debugging/visibility
  return o;
}

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
    // 🔤 pick lang from ?lang or Accept-Language; normalize to 'en' | 'hi'
    const qLang = (req.query?.lang || '').toString().toLowerCase();
    const headerLang = (req.headers['accept-language'] || '').toString().toLowerCase();
    const lang = (qLang || headerLang.split(',')[0]).split('-')[0] || 'en';
    const suf = lang === 'en' ? '' : `_${lang}`;

    const { category, tag, page = 1, limit = 10, excludeCategory } = req.query;
    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    let filter = {};

    // robust decode for category
    let decodedCategory = category;
    try {
      while (decodedCategory && decodedCategory.includes('%')) {
        decodedCategory = decodeURIComponent(decodedCategory);
      }
    } catch {
      decodedCategory = category;
    }

    if (decodedCategory && decodedCategory.toLowerCase() !== 'all') {
      const trimmedCategory = decodedCategory.trim();
      let categoryToMatch = trimmedCategory;
      if (trimmedCategory.includes('-&-')) {
        categoryToMatch = trimmedCategory
          .split('-&-')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' & ');
      }
      filter.category = { $regex: new RegExp(`^${categoryToMatch}$`, 'i') };
    }

    if (excludeCategory) {
      let decodedExcludeCategory = excludeCategory;
      try {
        while (decodedExcludeCategory && decodedExcludeCategory.includes('%')) {
          decodedExcludeCategory = decodeURIComponent(decodedExcludeCategory);
        }
      } catch {
        decodedExcludeCategory = excludeCategory;
      }
      const trimmedExcludeCategory = decodedExcludeCategory.trim();

      let categoryToExclude = trimmedExcludeCategory;
      if (trimmedExcludeCategory.includes('-&-')) {
        categoryToExclude = trimmedExcludeCategory
          .split('-&-')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' & ');
      }

      const allCategories = await Category.find({}, 'name_en').lean();
      const categoriesToInclude = allCategories
        .map(cat => cat.name_en)
        .filter(catName => !catName.toLowerCase().includes(categoryToExclude.toLowerCase()));

      filter.category = categoriesToInclude.length > 0 ? { $in: categoriesToInclude } : { $in: [] };
    }

    if (tag) {
      filter.tags = { $in: [new RegExp(`^${tag.trim()}$`, 'i')] };
    }

    const skip = (parsedPage - 1) * parsedLimit;
    const publicFilter = { ...filter, $or: [{ status: 'published' }, { status: { $exists: false } }] };

    // include base + localized fields for safe fallback
    const blogs = await Blog.find(publicFilter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .select('title title_en title_hi content content_en content_hi excerpt excerpt_en excerpt_hi image date category tags slug views likedBy shareCount comments');

    const blogsWithLikeCount = blogs.map(doc => {
      const b = doc.toObject();
      b.likes = Array.isArray(b.likedBy) ? b.likedBy.length : (b.likes || 0);
      // ✅ prefer requested lang -> English -> base
      b.title   = (suf && b[`title${suf}`])   || b.title_en   || b.title   || b.title_hi;
      b.excerpt = (suf && b[`excerpt${suf}`]) || b.excerpt_en || b.excerpt || b.excerpt_hi;
      b.content = (suf && b[`content${suf}`]) || b.content_en || b.content || b.content_hi;
      b.lang = lang;
      return b;
    });

    const totalBlogs = await Blog.countDocuments(publicFilter);
    const totalPages = Math.ceil(totalBlogs / parsedLimit);

    res.json({ blogs: blogsWithLikeCount, currentPage: parsedPage, totalPages, totalBlogs });
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
    const lang = getLang(req);

    const blogs = await Blog.find({
      $or: [{ status: 'published' }, { status: { $exists: false } }]
    })
      .sort({ date: -1 })
      .limit(5)
      .select('title title_en title_hi content content_en content_hi image date category tags slug views comments likes shareCount excerpt_en excerpt_hi likedBy');

    const localized = blogs.map(b => localizeBlog(b, lang));
    res.json(localized);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===============================
// Get Homepage Blogs (2 per category)
// ===============================
const getHomepageBlogs = async (req, res) => {
  try {
    const lang = getLang(req);

    const latestBlogs = await Blog.aggregate([
      { $match: { category: { $exists: true, $ne: null, $ne: "" },
                  $or: [{ status: 'published' }, { status: { $exists: false } }] } },
      { $sort: { date: -1 } },
      { $limit: 20 },
      { $addFields: { likes: { $size: { $ifNull: ['$likedBy', []] } } } }
      // no $project needed—keep all fields so we can localize below
    ]);

    // Localize each blog
    const localized = latestBlogs.map(b => localizeBlog(b, lang));
    res.json({ blogs: localized });
  } catch (err) {
    console.error('Error in getHomepageBlogs:', err);
    res.status(500).json({ error: 'Failed to retrieve homepage blogs.' });
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
    // 🔤 lang detection
    const qLang = (req.query?.lang || '').toString().toLowerCase();
    const headerLang = (req.headers['accept-language'] || '').toString().toLowerCase();
    const lang = (qLang || headerLang.split(',')[0]).split('-')[0] || 'en';
    const suf = lang === 'en' ? '' : `_${lang}`;

    const skip = (parsedPage - 1) * parsedLimit;
    const regex = new RegExp(q, 'i');

    const filter = {
      $and: [
        {
          $or: [
            { title: regex }, { content: regex },
            { title_en: regex }, { title_hi: regex },
            { content_en: regex }, { content_hi: regex },
            { tags: regex }, { category: regex }
          ]
        },
        { $or: [{ status: 'published' }, { status: { $exists: false } }] }
      ]
    };

    const blogs = await Blog.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parsedLimit)
      // include base + localized for safe fallback
      .select('title title_en title_hi content content_en content_hi excerpt excerpt_en excerpt_hi image date category tags slug views likedBy shareCount comments');

    const blogsWithLikeCount = blogs.map(doc => {
      const b = doc.toObject();
      b.likes = Array.isArray(b.likedBy) ? b.likedBy.length : (b.likes || 0);
      // ✅ prefer requested lang -> English -> base
      b.title   = (suf && b[`title${suf}`])   || b.title_en   || b.title   || b.title_hi;
      b.excerpt = (suf && b[`excerpt${suf}`]) || b.excerpt_en || b.excerpt || b.excerpt_hi;
      b.content = (suf && b[`content${suf}`]) || b.content_en || b.content || b.content_hi;
      b.lang = lang;
      return b;
    });

    const totalBlogs = await Blog.countDocuments(filter);
    const totalPages = Math.ceil(totalBlogs / parsedLimit);

    res.json({ blogs: blogsWithLikeCount, currentPage: parsedPage, totalPages, totalBlogs });
  } catch (err) {
    console.error('Error in searchBlogs:', err);
    res.status(500).json({ error: 'Failed to perform search.' });
  }
};

// ===============================
// Get single blog by slug (API ENDPOINT)
// ===============================
const getBlogBySlug = async (req, res) => {
  try {
    const lang = getLang(req);

    const blog = await Blog.findOne({
      slug: req.params.slug,
      $or: [{ status: 'published' }, { status: { $exists: false } }]
    })
      .populate('comments')
      .select('title title_en title_hi content content_en content_hi image date category tags slug views comments likes shareCount excerpt_en excerpt_hi likedBy');

    if (!blog) return res.status(404).json({ error: 'Blog not found' });

    const localized = localizeBlog(blog, lang);
    // keep your computed likes if you want
    localized.likes = Array.isArray(localized.likedBy) ? localized.likedBy.length : (localized.likes || 0);

    res.json(localized);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};





// ===============================
// Increment views
// ===============================
// server/controllers/blogController.js

const incrementViews = async (req, res) => {
  try {
    const { id } = req.params;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const { skipLog = false } = req.body || {};

    if (!skipLog) {
      const existingLog = await BlogViewLog.findOne({ blogId: id, ip });

      if (existingLog) {
        const secondsSinceLastView = (Date.now() - existingLog.lastViewed.getTime()) / 1000;

        // ✅ CHANGED: The cooldown is now 1 hour (3600 seconds)
        if (secondsSinceLastView < 3600) { 
          
          const blog = await Blog.findById(id).select('views');
          return res.json({ 
              message: 'View already counted within the last hour.', 
              views: blog ? blog.views : 0,
              skip: true 
          });
        }

        // If it's been more than an hour, update the timestamp for the next check
        existingLog.lastViewed = new Date();
        await existingLog.save();
      } else {
        // If this is the first view from this IP, log it
        await BlogViewLog.create({ blogId: id, ip });
      }
    }

    // This line now only runs if it's a new view (or a view after 1 hour)
    const updatedBlog = await Blog.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });
    
    if (!updatedBlog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json({ views: updatedBlog.views });
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
    const { visitorId } = req.body;

    if (!visitorId) {
        return res.status(400).json({ message: 'Visitor ID is required.' });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
        id,
        { $addToSet: { likedBy: visitorId } },
        { new: true }
    );

    if (!updatedBlog) return res.status(404).json({ message: 'Blog not found.' });

    // ✅ CHANGED: Return the entire updated blog object
    res.status(200).json({ message: 'Post liked successfully!', blog: updatedBlog });
  } catch (err) {
    res.status(500).json({ error: 'Failed to like the post.' });
  }
};


const unlikePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { visitorId } = req.body;

    if (!visitorId) {
        return res.status(400).json({ message: 'Visitor ID is required.' });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
        id,
        { $pull: { likedBy: visitorId } },
        { new: true }
    );

    if (!updatedBlog) return res.status(404).json({ message: 'Blog not found.' });

    // ✅ CHANGED: Return the entire updated blog object
    res.status(200).json({ message: 'Post unliked successfully!', blog: updatedBlog });
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
    // We now expect a visitorId from the client
    const { visitorId, name, comment } = req.body;

    if (!visitorId || !name || !comment) {
      return res.status(400).json({ message: 'Visitor ID, name, and comment are required.' });
    }

    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ message: 'Blog not found.' });

    // The new comment object includes the visitorId
    const newComment = { visitorId, name, comment, timestamp: new Date() };
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
    const { slug, categoryName } = req.params;

    if (!slug) {
      return res.status(400).send(generateSocialPreviewHTML(null, 'Invalid blog slug', categoryName));
    }

    let blog;

    if (categoryName) {
    
      const Category = require('../models/Category');
      
      let category = await Category.findOne({ slug: categoryName });

      // If not found, try with encoded ampersand format for backward compatibility
      if (!category) {
        const encodedCategoryName = categoryName.replace(/&/g, '-&-');
        category = await Category.findOne({ slug: encodedCategoryName });
      }

      // If still not found, try with decoded ampersand format
      if (!category) {
        const decodedCategoryName = categoryName.replace(/-&-/g, '&');
        category = await Category.findOne({ slug: decodedCategoryName });
      }

      if (!category) {
        return res.status(404).send(generateSocialPreviewHTML(null, 'Category not found', categoryName));
      }

      blog = await Blog.findOne({
        slug: slug,
        category: category.name_en,
        $or: [{ status: 'published' }, { status: { $exists: false } }]
      }).lean().select(
        'title title_en title_hi content content_en content_hi image date category tags slug views comments likes shareCount updatedAt'
      );
    } else {
      // Old slug-only structure (fallback)
      blog = await getBlogBySlugHelper(slug);
    }

    if (!blog) {
      return res.status(404).send(generateSocialPreviewHTML(null, 'Blog not found', categoryName));
    }

    // Check if request is from social media crawler
    const userAgent = req.get('User-Agent') || '';
    const isSocialCrawler = /facebookexternalhit|Twitterbot|LinkedInBot|WhatsApp|TelegramBot/i.test(userAgent);

    if (isSocialCrawler) {
      // Serve social media preview HTML for crawlers
      const html = generateSocialPreviewHTML(blog, null, categoryName);
      res.set('Content-Type', 'text/html');
      res.send(html);
    } else {
      // For regular users, redirect to frontend blog detail page
      const frontendUrl = process.env.NODE_ENV === 'production'
        ? process.env.CORS_ORIGIN_PROD || 'https://www.innvibs.com'
        : 'http://localhost:3000';

      if (categoryName) {
        // New category-based URL
        res.redirect(`${frontendUrl}/category/${categoryName}/${slug}`);
      } else {
        // Old URL structure (fallback)
        res.redirect(`${frontendUrl}/blog-detail/${slug}`);
      }
    }

  } catch (error) {
    console.error('Error generating social media preview:', error);
    res.status(500).send(generateSocialPreviewHTML(null, 'Internal server error', categoryName));
  }
};

// ===============================
// HTML Template Generator for Social Media Previews
// ===============================
const generateSocialPreviewHTML = (blog, errorMessage = null, categoryName = null) => {
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
        <meta property="og:image" content="${baseUrl}/header.png">
        <meta property="og:url" content="${baseUrl}">
        <meta property="og:site_name" content="InnVibs">

        <!-- Twitter -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${errorMessage || 'Blog Not Found'}">
        <meta name="twitter:description" content="Visit InnVibs for the latest blogs and insights">
        <meta name="twitter:image" content="${baseUrl}/header.png">
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
    imageUrl = `${baseUrl}/header.png`;
  }

  // Generate the correct URL based on whether we have a category
  // Use the category name as-is (with actual ampersand) for the URL
  const blogUrl = categoryName
    ? `${baseUrl}/category/${categoryName}/${blog.slug}`
    : `${baseUrl}/blog-detail/${blog.slug}`;

  // For social media previews, we want to use the category-based URL if available
  // This ensures social media platforms show the correct URL structure
  const socialMediaUrl = categoryName
    ? `${baseUrl}/category/${categoryName}/${blog.slug}`
    : blogUrl;

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
      <meta property="og:url" content="${socialMediaUrl}">
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
      <link rel="canonical" href="${socialMediaUrl}">
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
        <p><a href="${socialMediaUrl}">Read full article on InnVibs</a></p>
      </article>
    </body>
    </html>
  `;
};

// ===============================
// Get single blog by category and slug (for category-based URLs)
// ===============================
// In server/controllers/blogController.js

const getBlogByCategoryAndSlug = async (req, res) => {
  const { categoryName, slug } = req.params;

  try {
    const lang = getLang(req);

    // robust decode
    let decodedCategoryName = categoryName;
    try {
      while (decodedCategoryName && decodedCategoryName.includes('%')) {
        decodedCategoryName = decodeURIComponent(decodedCategoryName);
      }
    } catch {
      decodedCategoryName = categoryName;
    }

    // find category by slug; fallback to name_en
    let category = await Category.findOne({ slug: decodedCategoryName });
    if (!category) {
      let categoryNameToMatch = decodedCategoryName;
      if (decodedCategoryName.includes('-&-')) {
        categoryNameToMatch = decodedCategoryName
          .split('-&-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' & ');
      }
      category = await Category.findOne({
        name_en: { $regex: new RegExp(`^${categoryNameToMatch}$`, 'i') }
      });
    }

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const blog = await Blog.findOne({
      slug: slug,
      category: category.name_en, // you store category in English key
      $or: [{ status: 'published' }, { status: { $exists: false } }],
    }).select('title title_en title_hi content content_en content_hi image date category tags slug views comments likes shareCount excerpt_en excerpt_hi likedBy');

    if (!blog) {
      // debug logging stays if you want
      console.log(`❌ Blog not found: slug="${slug}" in category="${category.name_en}"`);
      return res.status(404).json({ error: 'Blog not found in this category' });
    }

    const localized = localizeBlog(blog, lang);
    localized.likes = Array.isArray(localized.likedBy) ? localized.likedBy.length : (localized.likes || 0);

    res.json(localized);
  } catch (err) {
    console.error(`Error in getBlogByCategoryAndSlug for slug "${slug}":`, err);
    res.status(500).json({ error: err.message });
  }
};

// ===============================
// Delete Blog
// ===============================
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the blog
    const deletedBlog = await Blog.findByIdAndDelete(id);

    if (!deletedBlog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json({
      message: 'Blog deleted successfully',
      deletedBlog: {
        id: deletedBlog._id,
        title: deletedBlog.title_en || deletedBlog.title
      }
    });
  } catch (err) {
    console.error('Error deleting blog:', err);
    res.status(500).json({ error: 'Failed to delete blog' });
  }
};

// ===============================
// Get single blog by id or slug (universal helper endpoint)
// ===============================
const getBlog = async (req, res) => {
  try {
    const lang = getLang(req);
    const { id, slug } = req.params || {};

    if (!id && !slug) {
      return res.status(400).json({ error: 'Missing blog identifier (id or slug).' });
    }

    // If slug is provided, only return published (or legacy without status)
    const query = slug
      ? Blog.findOne({
          slug,
          $or: [{ status: 'published' }, { status: { $exists: false } }],
        })
      : Blog.findById(id);

    const blog = await query
      .populate('comments')
      .select(
        'title title_en title_hi content content_en content_hi image date category tags slug views comments likes shareCount excerpt_en excerpt_hi likedBy status updatedAt'
      );

    if (!blog) return res.status(404).json({ error: 'Blog not found' });

    const localized = localizeBlog(blog, lang);
    localized.likes = Array.isArray(localized.likedBy)
      ? localized.likedBy.length
      : (localized.likes || 0);

    return res.json(localized);
  } catch (err) {
    console.error('Error in getBlog:', err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  // lists
  getBlogs,
  getHomepageBlogs,
  getLatestBlogs,
  searchBlogs,

  // singles
  getBlog,                      // ✅ now defined
  getBlogBySlug,
  getBlogByCategoryAndSlug,
  getBlogBySlugHelper,

  // social preview
  getSocialMediaPreview,

  // counters
  incrementViews,
  incrementShares,

  // reactions
  likePost,
  unlikePost,
  addComment,

  // admin
  deleteBlog,
};
