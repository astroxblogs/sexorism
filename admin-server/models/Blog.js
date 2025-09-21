const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    comment: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const BlogSchema = new mongoose.Schema({
    // Original fields
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },

    // Multilingual fields
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
    likes: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },
    slug: { type: String, unique: true, sparse: true },
    comments: [CommentSchema],
    status: {
        type: String,
        enum: ['pending', 'published', 'rejected'],
        default: 'published'
    },
    // --- CHANGE ---
    // Make createdBy required to ensure we always know the author.
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin', // This links to your Admin/Operator model
        required: true
    }
}, { timestamps: true }); // Adding timestamps for createdAt and updatedAt

module.exports = mongoose.model('Blog', BlogSchema);
