// main-blog-site/server/controllers/categoryController.js
const Category = require('../models/Category');

// This function gets ALL categories (existing code)
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find({});
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: "Error fetching categories", error: error.message });
    }
};

// ✅ NEW FUNCTION: Get a single category by its slug
exports.getCategoryBySlug = async (req, res) => {
    try {
        // URL decode the slug parameter (robust decoding for multiple levels)
        let decodedSlug = req.params.slug;
        try {
            // Keep decoding until no % characters remain
            while (decodedSlug && decodedSlug.includes('%')) {
                decodedSlug = decodeURIComponent(decodedSlug);
            }
        } catch (e) {
            decodedSlug = req.params.slug;
        }

        // Find category by slug with flexible matching
        let category = await Category.findOne({ slug: decodedSlug });

        // If not found by slug, try case-insensitive name matching
        if (!category) {
            // Handle special case: convert slug format to category name format
            let categoryNameToMatch = decodedSlug;
            if (decodedSlug.includes('-&-')) {
                categoryNameToMatch = decodedSlug
                    .split('-&-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' & ');
            }

            category = await Category.findOne({
                name_en: { $regex: new RegExp(`^${categoryNameToMatch}$`, 'i') }
            });
        }
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: "Error fetching category", error: error.message });
    }
};