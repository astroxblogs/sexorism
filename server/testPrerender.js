// server/testPrerender.js
require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Blog = require('./models/Blog'); // Make sure path is correct

const MONGO_URI = process.env.MONGO_URI;
const BACKEND_URL = 'https://ce3ae4dd17fa.ngrok-free.app'; // your backend port

async function testPrerender() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const blog = await Blog.findOne({});
    if (!blog) {
      console.error('No blog found in DB!');
      process.exit(1);
    }

    const slug = blog.slug;
    const url = `${BACKEND_URL}/blog/${slug}`;
    console.log('Testing Prerender for:', url);

    const response = await axios.get(url, {
      headers: { 'User-Agent': 'facebookexternalhit/1.1' }
    });

    const html = response.data;

    // Simple extraction of title and meta tags
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const ogTitleMatch = html.match(/<meta property="og:title" content="(.*?)"/i);
    const ogDescMatch = html.match(/<meta property="og:description" content="(.*?)"/i);

    console.log('\n------ Social Preview Info ------');
    console.log('Title:', titleMatch ? titleMatch[1] : 'N/A');
    console.log('OG Title:', ogTitleMatch ? ogTitleMatch[1] : 'N/A');
    console.log('OG Description:', ogDescMatch ? ogDescMatch[1] : 'N/A');
    console.log('------ End of Info ------');

    mongoose.disconnect();
 } catch (err) {
    console.error('\n--- AXIOS REQUEST FAILED ---');
    if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Status:', err.response.status);
        console.error('Headers:', err.response.headers);
        console.error('Data:', err.response.data);
    } else if (err.request) {
        // The request was made but no response was received
        console.error('Error: No response received from the server.');
        console.error('This usually means the server is not running or is unreachable.');
        console.error(err.request);
    } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error:', err.message);
    }
    console.error('--------------------------\n');
    mongoose.disconnect();
}}

testPrerender();
