const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

const Blog = require('../../models/Blog');

// ✅ ADDED: Configure Cloudinary at the top of the file
// IMPORTANT: Make sure you have these values in your .env file
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper function to generate slug from title
const generateSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .trim('-'); // Remove leading/trailing hyphens
};

// Function to generate unique slug
const generateUniqueSlug = async (title, existingId = null) => {
    let baseSlug = generateSlug(title);
    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const query = { slug };
        if (existingId) {
            query._id = { $ne: existingId };
        }
        
        const existing = await Blog.findOne(query);
        if (!existing) {
            return slug;
        }
        
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
};

exports.getLatestBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({})
            .sort({ date: -1 })
            .limit(5);
        res.json(blogs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

 
 
// ✅ ADD THIS ENTIRE FUNCTION TO YOUR CONTROLLER
exports.uploadImage = async (req, res) => {
    try {
        // Check if a file was provided in the request
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided.' });
        }

        // A helper function to upload a buffer to Cloudinary
        const uploadFromBuffer = (buffer) => {
            return new Promise((resolve, reject) => {
                const cld_upload_stream = cloudinary.uploader.upload_stream(
                    { folder: "astroxblogs" }, // Optional: you can name a folder in Cloudinary
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
                // Use streamifier to pipe the buffer to the upload stream
                streamifier.createReadStream(buffer).pipe(cld_upload_stream);
            });
        };

        // Call the helper function with the file's buffer
        const result = await uploadFromBuffer(req.file.buffer);

        // Send back the secure URL of the uploaded image
        res.status(200).json({ imageUrl: result.secure_url });

    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        res.status(500).json({ error: 'Failed to upload image.' });
    }
};


exports.getBlogs = async (req, res) => {
    try {
        const { category, tag, page = 1, limit = 10 } = req.query;
        const parsedLimit = parseInt(limit, 10);
        const parsedPage = parseInt(page, 10);

        if (isNaN(parsedLimit) || parsedLimit <= 0) {
            return res.status(400).json({ error: 'Invalid limit parameter.' });
        }
        if (isNaN(parsedPage) || parsedPage <= 0) {
            return res.status(400).json({ error: 'Invalid page parameter.' });
        }

        let filter = {};
        if (category) filter.category = category.trim();
        if (tag) filter.tags = { $in: [new RegExp(`^${tag.trim()}$`, 'i')] };

        // ✅ --- THIS IS THE CORRECT LOGIC ---
        // It ensures admins ONLY see published blogs in this list.
        if (req.user?.role === 'operator') {
            filter.createdBy = req.user.id;
        } else {
            filter.status = 'published'; // Only fetch published blogs for the admin's main list
        }
        // ✅ --- END FIX ---

        const skip = (parsedPage - 1) * parsedLimit;
        const blogs = await Blog.find(filter)
            .populate({ path: 'createdBy', select: 'username' })
            .sort({ date: -1 })
            .skip(skip)
            .limit(parsedLimit)
            .exec();

        const totalBlogs = await Blog.countDocuments(filter);
        const totalPages = Math.ceil(totalBlogs / parsedLimit);

        res.json({ blogs, currentPage: parsedPage, totalPages, totalBlogs });
    } catch (err) {
        console.error("Error in getBlogs:", err);
        res.status(500).json({ error: err.message || 'Failed to retrieve blogs.' });
    }
};
 
exports.searchBlogs = async (req, res) => {
    // ... logic from your file ...
    const { q, page = 1, limit = 10 } = req.query;
    if (!q) {
        return res.status(400).json({ error: 'A search query "q" is required.' });
    }
    try {
        const regex = new RegExp(q, 'i');
        const searchFilter = {
            $or: [
                { title: regex }, { content: regex }, { title_en: regex },
                { title_hi: regex }, { content_en: regex }, { content_hi: regex },
                { tags: regex }, { category: regex }
            ]
        };

        // ✅ --- APPLYING THE FIX TO SEARCH AS WELL ---
        if (req.user?.role === 'operator') {
            searchFilter.createdBy = req.user.id;
        } else {
            searchFilter.status = 'published'; // Also apply to search results for admin
        }
        // ✅ --- END FIX ---

        const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
        const blogs = await Blog.find(searchFilter)
            .populate({ path: 'createdBy', select: 'username' })
            .sort({ date: -1 })
            .skip(skip)
            .limit(parseInt(limit, 10))
            .exec();

        const totalBlogs = await Blog.countDocuments(searchFilter);
        const totalPages = Math.ceil(totalBlogs / parseInt(limit, 10));
        res.json({ blogs, currentPage: parseInt(page, 10), totalPages, totalBlogs });
    } catch (err) {
        console.error("Error in searchBlogs:", err);
        res.status(500).json({ error: 'Failed to perform search.' });
    }
}

// --- UNCHANGED FUNCTIONS ---
exports.getBlog = async (req, res) => { /* ... unchanged ... */ 
    try {
        const blog = await Blog.findById(req.params.id); 
        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        res.json(blog);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.createBlog = async (req, res) => { /* ... unchanged ... */ 
    try {
        const title = req.body.title_en || req.body.title;
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }
        
        const slug = await generateUniqueSlug(title);
        const blogData = { ...req.body, slug, createdBy: req.user.id };

        if (req.user?.role === 'operator') {
            blogData.status = 'pending';
        } else if (req.user?.role === 'admin') {
            blogData.status = req.body.status || 'published';
        }
        
        const blog = new Blog(blogData);
        await blog.save();
        res.status(201).json(blog);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.updateBlog = async (req, res) => { /* ... unchanged ... */ 
    try {
        const title = req.body.title_en || req.body.title;
        if (title) {
            req.body.slug = await generateUniqueSlug(title, req.params.id);
        }

        const existing = await Blog.findById(req.params.id);
        if (!existing) return res.status(404).json({ error: 'Blog not found' });

        if (req.user?.role === 'operator') {
            if (existing.createdBy?.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Forbidden: You can only edit your own blogs.' });
            }
            req.body.status = 'pending';
        }

        const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(blog);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};



exports.updateBlogDate = async (req, res) => {
    try {
        const { date } = req.body;
        if (!date) {
            return res.status(400).json({ error: 'Date is required.' });
        }

        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        // Update the date and save the document
        blog.date = new Date(date);
        await blog.save();

        res.json({ message: 'Blog date updated successfully', blog });
    } catch (err) {
        console.error("Error updating blog date:", err);
        res.status(500).json({ error: 'Failed to update blog date.' });
    }
};



exports.deleteBlog = async (req, res) => { /* ... unchanged ... */ 
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden: You do not have permission to delete blogs.' });
        }

        const blog = await Blog.findByIdAndDelete(req.params.id);
        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        res.json({ message: 'Blog deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getPendingBlogs = async (req, res) => { /* ... unchanged ... */ 
    try {
        const { page = 1, limit = 20 } = req.query;
        const parsedLimit = parseInt(limit, 10);
        const parsedPage = parseInt(page, 10);
        const skip = (parsedPage - 1) * parsedLimit;
        const filter = { status: 'pending' };
        
        const blogs = await Blog.find(filter)
            .populate({
                path: 'createdBy',
                select: 'username' 
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parsedLimit)
            .exec();
            
        const totalBlogs = await Blog.countDocuments(filter);
        
        res.json({ blogs, currentPage: parsedPage, totalPages: Math.ceil(totalBlogs / parsedLimit), totalBlogs });
    } catch (err) {
        console.error("Error in getPendingBlogs:", err);
        res.status(500).json({ error: err.message });
    }
};
exports.approveBlog = async (req, res) => { /* ... unchanged ... */ 
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        blog.status = 'published';
        await blog.save();
        res.json({ message: 'Blog approved', blog });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.rejectBlog = async (req, res) => { /* ... unchanged ... */ 
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        blog.status = 'rejected';
        await blog.save();
        res.json({ message: 'Blog rejected', blog });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// ✅ NEW: Move a published blog back to "pending" (Deactivate)
//    - Admin-only
//    - Returns the updated blog document
exports.deactivateBlog = async (req, res) => {
    try {
        // Only admins can deactivate
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden: Only admins can deactivate blogs.' });
        }

        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        // If it's already pending or rejected, keep behavior predictable
        if (blog.status === 'pending') {
            return res.json({ message: 'Blog is already pending.', blog });
        }

        // Flip to pending
        blog.status = 'pending';
        await blog.save();

        // Success: this will disappear from Manage Blogs (published-only list)
        // and appear in Pending Approvals.
        return res.json({ message: 'Blog moved to pending (deactivated).', blog });
    } catch (err) {
        console.error("Error in deactivateBlog:", err);
        return res.status(500).json({ error: err.message || 'Failed to deactivate blog.' });
    }
};

exports.addComment = async (req, res) => { /* ... unchanged ... */ 
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        const comment = { name: req.body.name, comment: req.body.comment };
        blog.comments.push(comment);
        await blog.save();
        res.status(201).json(blog.comments[blog.comments.length - 1]);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.deleteComment = async (req, res) => { /* ... unchanged ... */ 
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        blog.comments.id(req.params.commentId).remove();
        await blog.save();
        res.json({ message: 'Comment deleted' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.likeBlog = async (req, res) => { /* ... unchanged ... */ 
    try {
        const blog = await Blog.findByIdAndUpdate(
            req.params.id,
            { $inc: { likes: 1 } },
            { new: true }
        );
        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        res.json({ likes: blog.likes });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};