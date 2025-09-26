// server/controllers/categoryController.js
const Category = require('../../models/Category');

exports.createCategory = async (req, res) => {
    try {
        const { name_en, name_hi } = req.body;

        // --- ADDED .trim() TO REMOVE WHITESPACE ---
        const trimmed_name_en = name_en.trim();
        const trimmed_name_hi = name_hi ? name_hi.trim() : null;

        if (!trimmed_name_en) {
            return res.status(400).json({ message: "English category name is required." });
        }

        const newCategory = new Category({
            name_en: trimmed_name_en,
            name_hi: trimmed_name_hi,
            slug: trimmed_name_en.toLowerCase().replace(/\s+/g, '-') // Generate slug
        });

        const savedCategory = await newCategory.save();
        res.status(201).json(savedCategory);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "Category with this name already exists." });
        }
        res.status(500).json({ message: "Error creating category", error: error.message });
    }
};


exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find({});
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: "Error fetching categories", error: error.message });
    }
};

// --- NEW FUNCTION TO DELETE A CATEGORY ---
exports.deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const deletedCategory = await Category.findByIdAndDelete(categoryId);

        if (!deletedCategory) {
            return res.status(404).json({ message: "Category not found." });
        }

        res.status(200).json({ message: "Category deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error deleting category", error: error.message });
    }
};