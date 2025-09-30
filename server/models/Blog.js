const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    visitorId: { type: String, required: true },
    name: { type: String, required: true },
    comment: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const BlogSchema = new mongoose.Schema({
    // --- Core Fields ---
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

    // ✅ NEW SEO & EXCERPT FIELDS
    excerpt_en: {
        type: String,
        trim: true
    },
    excerpt_hi: {
        type: String,
        trim: true
    },
    metaTitle_en: {
        type: String,
        trim: true
    },
    metaTitle_hi: {
        type: String,
        trim: true
    },
    metaDescription_en: {
        type: String,
        trim: true
    },
    metaDescription_hi: {
        type: String,
        trim: true
    },

    image: { type: String },
    date: { type: Date, default: Date.now },
    category: {
        type: String,
        required: true
    },
    tags: [String],
    slug: { type: String, unique: true, sparse: true },
    comments: [CommentSchema],
    
    // --- Admin & Operator Fields ---
    status: {
        type: String,
        enum: ['pending', 'published', 'rejected'],
        default: 'published'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },

    // --- Public Interaction Fields ---
    likedBy: {
        type: [String],
        default: []
    },
    views: {
        type: Number,
        default: 0
    },
    shareCount: {
        type: Number,
        default: 0
    },
}, { timestamps: true });


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
        
        while (await mongoose.models.Blog.findOne({ slug: slug, _id: { $ne: this._id } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
        
        this.slug = slug;
    }
    next();
});

module.exports = mongoose.model('Blog', BlogSchema);