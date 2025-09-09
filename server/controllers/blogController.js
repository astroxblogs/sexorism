const Blog = require('../models/Blog');

// Helper function to generate slug from title
const generateSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .trim('-'); // Remove leading/trailing hyphens
};

// Get all blogs for the homepage, with pagination and filtering
const getBlogs = async (req, res) => {
    try {
        const { category, tag, page = 1, limit = 10, excludeCategory } = req.query;
        const parsedLimit = parseInt(limit, 10);
        const parsedPage = parseInt(page, 10);

        if (isNaN(parsedLimit) || parsedLimit <= 0) {
            return res.status(400).json({ error: 'Invalid limit parameter. Must be a positive number.' });
        }
        if (isNaN(parsedPage) || parsedPage <= 0) {
            return res.status(400).json({ error: 'Invalid page parameter. Must be a positive number.' });
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
        const blogs = await Blog.find(filter)
            .sort({ date: -1 })
            .skip(skip)
            .limit(parsedLimit)
            // --- FIX: Added 'likes' to the select statement ---
            .select('title title_en title_hi content content_en content_hi image date category tags slug views comments likes');

        const totalBlogs = await Blog.countDocuments(filter);
        const totalPages = Math.ceil(totalBlogs / parsedLimit);

        res.json({ blogs, currentPage: parsedPage, totalPages, totalBlogs });
    } catch (err) {
        console.error("Error in getBlogs:", err);
        res.status(500).json({ error: err.message || 'Failed to retrieve blogs.' });
    }
};

// Get the 5 latest blogs (for carousel)
const getLatestBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find()
        .sort({ date: -1 })
        .limit(5)
        // --- FIX: Added 'likes' to the select statement ---
        .select('title title_en title_hi content content_en content_hi image date category tags slug views comments likes');
        res.json(blogs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Search blogs
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
            ]
        };
        const skip = (parsedPage - 1) * parsedLimit;

        const blogs = await Blog.find(searchFilter)
            .sort({ date: -1 })
            .skip(skip)
            .limit(parsedLimit)
            // --- FIX: Added 'likes' to the select statement ---
            .select('title title_en title_hi content content_en content_hi image date category tags slug views comments likes');
            

        const totalBlogs = await Blog.countDocuments(searchFilter);
        const totalPages = Math.ceil(totalBlogs / parsedLimit);

        res.json({ blogs, currentPage: parsedPage, totalPages, totalBlogs });
    } catch (err) {
        console.error("Error in searchBlogs:", err);
        res.status(500).json({ error: 'Failed to perform search.' });
    }
};

// Get a single blog by ID
const getBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        res.json(blog);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get a single blog by slug
const getBlogBySlug = async (req, res) => {
    try {
        const blog = await Blog.findOne({ slug: req.params.slug });
        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        res.json(blog);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
// Increment view count
const incrementViews = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Blog.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });
        if (!updated) return res.status(404).json({ error: 'Blog not found' });
        res.json({ views: updated.views });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Increment share count
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

// ===================================
// NEW FUNCTIONS TO ADD
// ===================================

const likePost = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).json({ message: 'Blog post not found.' });
        }

        blog.likes = (blog.likes || 0) + 1;
        await blog.save();

        res.status(200).json({ message: 'Post liked successfully!', likes: blog.likes });
    } catch (err) {
        console.error("Error liking post:", err);
        res.status(500).json({ error: 'Failed to like the post.' });
    }
};

const unlikePost = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).json({ message: 'Blog post not found.' });
        }

        blog.likes = Math.max((blog.likes || 0) - 1, 0);
        await blog.save();

        res.status(200).json({ message: 'Post unliked successfully!', likes: blog.likes });
    } catch (err) {
        console.error("Error unliking post:", err);
        res.status(500).json({ error: 'Failed to unlike the post.' });
    }
};

const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        // Corrected: Read 'name' and 'comment' from the request body
        const { name, comment } = req.body;

        if (!name || !comment) {
            return res.status(400).json({ message: 'Name and comment are required.' });
        }

        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).json({ message: 'Blog post not found.' });
        }

        const newComment = {
            name,
            comment,
            timestamp: new Date()
        };

        blog.comments.push(newComment);
        await blog.save();

        res.status(201).json({ message: 'Comment added successfully!', comment: newComment });
    } catch (err) {
        console.error("Error adding comment:", err);
        res.status(500).json({ error: 'Failed to add the comment.' });
    }
};


// Export all the functions, including the new ones
module.exports = {
    getBlogs,
    getLatestBlogs,
    searchBlogs,
    getBlog,
    getBlogBySlug,
    incrementViews,
    likePost,
    unlikePost,
    addComment,
    incrementShares,
};
