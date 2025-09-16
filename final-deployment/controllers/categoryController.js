// main-blog-site/server/controllers/categoryController.js
const Category = require('../models/Category');

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find({});
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: "Error fetching categories", error: error.message });
    }
};