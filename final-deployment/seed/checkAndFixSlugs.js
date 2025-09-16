require('dotenv').config();
const mongoose = require('mongoose');
const Blog = require('../models/Blog');

// Helper function to generate slug from title
const generateSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .trim('-'); // Remove leading/trailing hyphens
};

// Function to generate unique slug
const generateUniqueSlug = async (title, existingId = null) => {
    let baseSlug = generateSlug(title);
    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const query = { slug };
        if (existingId) {
            query._id = { $ne: existingId };
        }
        
        const existing = await Blog.findOne(query);
        if (!existing) {
            return slug;
        }
        
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
};

const checkAndFixSlugs = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            console.error('MONGO_URI environment variable is not set. Please set it in your .env file.');
            process.exit(1);
        }
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // Find all blogs without slugs
        const blogsWithoutSlugs = await Blog.find({ $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }] });
        console.log(`Found ${blogsWithoutSlugs.length} blogs without slugs`);

        if (blogsWithoutSlugs.length === 0) {
            console.log('All blogs have slugs!');
            process.exit(0);
        }

        for (const blog of blogsWithoutSlugs) {
            const title = blog.title_en || blog.title;
            if (!title) {
                console.log(`Skipping blog ${blog._id} - no title found`);
                continue;
            }

            const slug = await generateUniqueSlug(title, blog._id);
            blog.slug = slug;
            await blog.save();
            console.log(`Generated slug "${slug}" for blog "${title}" (ID: ${blog._id})`);
        }

        console.log('Slug generation completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error generating slugs:', error);
        process.exit(1);
    }
};

// Run the script if called directly
if (require.main === module) {
    checkAndFixSlugs();
}

module.exports = { checkAndFixSlugs };
