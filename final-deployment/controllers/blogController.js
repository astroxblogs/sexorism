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
    console.log('🔍 Fetching blog by slug for social preview:', slug);
    
    const blog = await Blog.findOne({
      slug: slug.toLowerCase(),
      $or: [{ status: 'published' }, { status: { $exists: false } }]
    })
      .lean() // Use lean() for better performance since we don't need Mongoose document methods
      .select(
        'title title_en title_hi content content_en content_hi image date category tags slug views comments likes shareCount updatedAt'
      );
    
    if (blog) {
      console.log('✅ Blog found for social preview:', blog.title);
      return blog;
    } else {
      console.log('❌ No blog found with slug:', slug);
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching blog by slug for social preview:', error);
    throw error;
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
        const hoursSinceLastView = (Date.now() - existingLog.lastViewed.getTime()) / (1000 * 60 * 60);

        if (hoursSinceLastView < 12) {
          // Frontend should already have skipped, but safety net
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
// Export
// ===============================
module.exports = {
  getBlogs,
  getLatestBlogs,
  searchBlogs,
  getBlog,
  getBlogBySlug,
  getBlogBySlugHelper, // NEW: Helper function for social media previews
  incrementViews,
  incrementShares,
  likePost,
  unlikePost,
  addComment
};