const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    comment: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const BlogSchema = new mongoose.Schema({
    // Original fields - keeping them for now, but consider if they are still strictly needed
    // or if title_en/content_en should fully replace them.
    // If you plan to fully rely on _en fields, these can eventually be removed.
    title: {
        type: String,
        required: true // Keeping required for original title if needed as fallback
    },
    content: {
        type: String,
        required: true // Keeping required for original content if needed as fallback
    },

    // Multilingual fields - Make them NOT required
    title_en: { type: String }, // Assuming English is the primary default, can be required if always needed
    title_hi: { type: String },


    content_en: { type: String }, // Assuming English is the primary default, can be required if always needed
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
    comments: [CommentSchema]
    ,
    status: {
        type: String,
        enum: ['pending', 'published', 'rejected'],
        default: 'published'
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: false }
}, { timestamps: true }); // Adding timestamps for createdAt and updatedAt

module.exports = mongoose.model('Blog', BlogSchema);