require('dotenv').config(); // Keep this at the very top
const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err)); // Added error logging for connection

const seedBlogs = [
  {
    title: "Hello World (English)", // Original title field
    content: "This is the first blog post in English.", // Original content field
    title_en: "Hello World (English)", // <-- ADDED: English title
    content_en: "This is the first blog post in English. This content is in English.", // <-- ADDED: English content
    category: "Technology", // <-- ADDED: A default category
    image: "https://placehold.co/600x300/666/fff?text=Hello+World+EN", // Updated placeholder for clarity
    tags: ["welcome", "english", "tutorial"],
    likes: 0,
    comments: [],
    // language: "en", // Removed this, as we now use specific language fields
  },
  {
    title: "नमस्ते दुनिया (Hindi)", // Original title field
    content: "यह हिंदी में पहला ब्लॉग पोस्ट है।", // Original content field
    title_hi: "नमस्ते दुनिया (Hindi)", // <-- ADDED: Hindi title
    content_hi: "यह हिंदी में पहला ब्लॉग पोस्ट है। यह सामग्री हिंदी में है।", // <-- ADDED: Hindi content
    title_en: "Hello World (Hindi - English Fallback)", // <-- ADDED: English fallback for Hindi blog
    content_en: "This is the first blog post in Hindi. This content is in Hindi, with an English fallback.", // <-- ADDED: English fallback for Hindi blog
    category: "Lifestyle", // <-- ADDED: A default category
    image: "https://placehold.co/600x300/666/fff?text=Hello+World+HI", // Updated placeholder for clarity
    tags: ["welcome", "hindi", "culture"],
    likes: 0,
    comments: [],
    // language: "hi", // Removed this
  }

];
 
const seedAdmin = async () => {
  const hash = await bcrypt.hash('Innvibs@123', 10);
  return {
    username: 'Astrox',
    password: hash,
    role: 'admin' //  
  };
};

async function seed() {
  try {

    await Blog.insertMany(seedBlogs);
    console.log('Blogs seeded successfully!');

    await Admin.create(await seedAdmin());  
    console.log('Admin user seeded successfully!');

    console.log('Seeding complete: blogs and admin are in the database!');
  } catch (error) {
    console.error('Error during seeding process:', error);
  } finally {
    mongoose.disconnect();
  }
}

seed();