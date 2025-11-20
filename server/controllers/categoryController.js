// server/controllers/categoryController.js
const Category = require('../models/Category');
const { Types } = require('mongoose');
// Helper: keep only fields the FE needs
const shape = (cat) => ({
  _id: cat._id,
  slug: cat.slug,
  name_en: cat.name_en,
  name_hi: cat.name_hi,
  image: cat.image,
  metaTitle_en: cat.metaTitle_en,
  metaTitle_hi: cat.metaTitle_hi,
  metaDescription_en: cat.metaDescription_en,
  metaDescription_hi: cat.metaDescription_hi,
  createdAt: cat.createdAt,
  updatedAt: cat.updatedAt,
});

// GET /api/categories  → list (kept as-is; you can project if desired)
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

// ✅ GET /api/categories/by-slug/:slug  → single by slug (with SEO fields)
exports.getCategoryBySlug = async (req, res) => {
  try {
    // Robust decode (handles multi-encoded strings)
    let decodedSlug = req.params.slug || '';
    try {
      while (decodedSlug && decodedSlug.includes('%')) {
        decodedSlug = decodeURIComponent(decodedSlug);
      }
    } catch {
      decodedSlug = req.params.slug || '';
    }

    // Tolerate both "-and-" and "-&-" styles
    const alt = decodedSlug.replace(/-and-/g, '-&-');
    const alt2 = decodedSlug.replace(/-&-/g, '-and-');

    // Best-guess a name from the slug (for name fallback)
    const nameGuess = decodedSlug
      .replace(/-and-/g, ' & ')
      .replace(/-/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const cat = await Category.findOne({
      $or: [
        { slug: decodedSlug },
        { slug: alt },
        { slug: alt2 },
        { name_en: new RegExp(`^${nameGuess}$`, 'i') },
        { name_hi: new RegExp(`^${nameGuess}$`, 'i') },
      ],
    })
      .select('slug name_en name_hi image metaTitle_en metaTitle_hi metaDescription_en metaDescription_hi createdAt updatedAt')
      .lean();

    if (!cat) return res.status(404).json({ message: 'Category not found' });

    return res.status(200).json(shape(cat));
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching category', error: error.message });
  }
};

// ✅ GET /api/categories/:id  → single by Mongo _id (with SEO fields)
exports.getCategoryById = async (req, res) => {
  try {
    const id = req.params.id;

    // ✅ Validate ObjectId first to avoid casting errors
    if (!Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const cat = await Category.findById(id)
      .select('slug name_en name_hi image metaTitle_en metaTitle_hi metaDescription_en metaDescription_hi createdAt updatedAt')
      .lean();

    if (!cat) return res.status(404).json({ message: 'Category not found' });

    const shaped = {
      _id: cat._id,
      slug: cat.slug,
      name_en: cat.name_en,
      name_hi: cat.name_hi,
      image: cat.image,
      metaTitle_en: cat.metaTitle_en,
      metaTitle_hi: cat.metaTitle_hi,
      metaDescription_en: cat.metaDescription_en,
      metaDescription_hi: cat.metaDescription_hi,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    };

    return res.status(200).json(shaped);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching category', error: error.message });
  }
};
