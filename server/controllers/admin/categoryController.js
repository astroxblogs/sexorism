// server/controllers/admin/categoryController.js
const Category = require('../../models/Category');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// ✅ ADDED: Configure Cloudinary at the top of the file
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// ✅ ADDED: Function to upload category images
exports.uploadImage = async (req, res) => {
    try {
        // Check if a file was provided in the request
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided.' });
        }

        // Process the image to ensure square aspect ratio (500x500)
        const sharp = require('sharp');
        const processedBuffer = await sharp(req.file.buffer)
            .resize(500, 500, {
                fit: 'cover', // Crop to cover the 500x500 area
                position: 'center' // Center the crop
            })
            .jpeg({ quality: 90 }) // Convert to JPEG with 90% quality
            .toBuffer();

        // A helper function to upload a buffer to Cloudinary
        const uploadFromBuffer = (buffer) => {
            return new Promise((resolve, reject) => {
                const cld_upload_stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "astroxblogs/categories",
                        transformation: [
                            { width: 500, height: 500, crop: 'fill', gravity: 'auto' }
                        ]
                    },
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
                // Use streamifier to pipe the buffer to the upload stream
                streamifier.createReadStream(buffer).pipe(cld_upload_stream);
            });
        };

        // Call the helper function with the processed buffer
        const result = await uploadFromBuffer(processedBuffer);

        // Send back the secure URL of the uploaded image
        res.status(200).json({ imageUrl: result.secure_url });

    } catch (error) {
        console.error('Error uploading category image to Cloudinary:', error);
        res.status(500).json({ error: 'Failed to upload image.' });
    }
};

// This function now handles the new SEO fields and image
exports.createCategory = async (req, res) => {
    try {
        const { name_en, name_hi, metaTitle_en, metaTitle_hi, metaDescription_en, metaDescription_hi, image } = req.body;

        const trimmed_name_en = name_en ? name_en.trim() : "";

        if (!trimmed_name_en) {
            return res.status(400).json({ message: "English category name is required." });
        }

        const newCategory = new Category({
            name_en: trimmed_name_en,
            name_hi: name_hi ? name_hi.trim() : null,
            slug: trimmed_name_en.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'), // Generate a clean slug
            image: image ? image.trim() : null,
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

// ✅ NEW FUNCTION TO UPDATE A CATEGORY (now includes image)
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        // If the English name is being updated, regenerate the slug to match
        if (updateData.name_en) {
            updateData.slug = updateData.name_en.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
        }

        // Handle image field
        if (updateData.image !== undefined) {
            updateData.image = updateData.image ? updateData.image.trim() : null;
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