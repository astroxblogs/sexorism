const mongoose = require('mongoose');

// Using the more advanced CommentSchema from the main server
// It includes visitorId to track unique commenters
const CommentSchema = new mongoose.Schema({
    visitorId: { type: String, required: true },
    name: { type: String, required: true },
    comment: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const BlogSchema = new mongoose.Schema({
    // --- Core Fields from Both Models ---
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    title_en: { type: String },
    title_hi: { type: String },
    content_en: { type: String },
    content_hi: { type: String },
    image: { type: String },
    date: { type: Date, default: Date.now },
    category: {
        type: String,
        required: true
    },
    tags: [String],
    slug: { type: String, unique: true, sparse: true },
    comments: [CommentSchema], // Uses the advanced CommentSchema
    
    // --- Admin & Operator Fields ---
    status: {
        type: String,
        enum: ['pending', 'published', 'rejected'],
        default: 'published'
    },
    // Using the stricter 'required: true' from the admin-server model
    // This ensures every blog post must have an author.
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },

    // --- Public Interaction Fields from Main Server ---
    // Using 'likedBy' array to store unique visitor IDs, which is more robust
    likedBy: {
        type: [String],
        default: []
    },
    // Keeping the 'views' field from the main server model
    views: {
        type: Number,
        default: 0
    },
    shareCount: {
        type: Number,
        default: 0
    },
}, { timestamps: true }); // Using timestamps for createdAt and updatedAt


// --- Logic from Main Server for Auto-Slug Generation ---
// This pre-save hook automatically creates a URL-friendly slug from the title.
BlogSchema.pre('save', async function(next) {
    if (this.isModified('title_en') || this.isModified('title') || !this.slug) {
        const title = this.title_en || this.title;
        let baseSlug = title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
        
        let slug = baseSlug;
        let counter = 1;
        
        // Ensure the slug is unique
        while (await mongoose.models.Blog.findOne({ slug: slug, _id: { $ne: this._id } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
        
        this.slug = slug;
    }
    next();
});

module.exports = mongoose.model('Blog', BlogSchema);