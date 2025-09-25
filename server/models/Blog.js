const mongoose = require('mongoose');

// CHANGED: CommentSchema now includes a visitorId to track the commenter
const CommentSchema = new mongoose.Schema({
    visitorId: { type: String, required: true }, // ADDED: Tracks the anonymous user
    name: { type: String, required: true },
    comment: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const BlogSchema = new mongoose.Schema({
    
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

    // CHANGED: 'likes' is now 'likedBy', an array of unique visitor IDs.
    likedBy: { 
        type: [String], 
        default: [] 
    },

    views: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },
    slug: { type: String, unique: true, sparse: true },
    comments: [CommentSchema],
    status: {
        type: String,
        enum: ['pending', 'published', 'rejected'],
        default: 'published'
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: false }
}, { timestamps: true });

function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}
 
BlogSchema.pre('save', function(next) {
    if (this.isModified('title') || !this.slug) {
        this.slug = generateSlug(this.title);
    }
    next();
});

module.exports = mongoose.model('Blog', BlogSchema);