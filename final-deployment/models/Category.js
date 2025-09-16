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
    }
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);