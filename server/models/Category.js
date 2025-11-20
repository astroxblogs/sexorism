// main-blog-site/server/models/Category.js
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name_en: {
        type: String,
        required: true,
        unique: true
    },
    name_hi: {
        type: String,
        unique: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    image: {
        type: String,
        trim: true
    },

    // ✅ NEW SEO FIELDS
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
    }

}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);