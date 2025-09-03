const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
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
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },
    slug: { type: String, unique: true, sparse: true },
    comments: [CommentSchema]
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