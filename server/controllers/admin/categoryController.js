// server/controllers/admin/categoryController.js
const Category = require('../../models/Category');

// This function now handles the new SEO fields
exports.createCategory = async (req, res) => {
    try {
        const { name_en, name_hi, metaTitle_en, metaTitle_hi, metaDescription_en, metaDescription_hi } = req.body;

        const trimmed_name_en = name_en ? name_en.trim() : "";

        if (!trimmed_name_en) {
            return res.status(400).json({ message: "English category name is required." });
        }

        const newCategory = new Category({
            name_en: trimmed_name_en,
            name_hi: name_hi ? name_hi.trim() : null,
            slug: trimmed_name_en.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'), // Generate a clean slug
            metaTitle_en,
            metaTitle_hi,
            metaDescription_en,
            metaDescription_hi,
        });

        const savedCategory = await newCategory.save();
        res.status(201).json(savedCategory);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "A category with this name already exists." });
        }
        res.status(500).json({ message: "Error creating category", error: error.message });
    }
};


exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find({}).sort({ name_en: 1 }); // Sort alphabetically
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: "Error fetching categories", error: error.message });
    }
};

// ✅ NEW FUNCTION TO UPDATE A CATEGORY
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        // If the English name is being updated, regenerate the slug to match
        if (updateData.name_en) {
            updateData.slug = updateData.name_en.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
        }

        const updatedCategory = await Category.findByIdAndUpdate(id, updateData, {
            new: true, // Return the updated document
            runValidators: true, // Ensure schema rules are checked
        });

        if (!updatedCategory) {
            return res.status(404).json({ message: "Category not found." });
        }

        res.status(200).json(updatedCategory);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "A category with this name already exists." });
        }
        res.status(500).json({ message: "Error updating category", error: error.message });
    }
};


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