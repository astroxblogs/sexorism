const Subscriber = require('../models/Subscriber');
const Blog = require('../models/Blog');

/**
 * A reusable helper function to update a subscriber's inferred categories based on an interaction.
 * This version works with a simple array in the database.
 * @param {string} subscriberId - The ID of the subscriber.
 * @param {string} blogId - The ID of the blog.
 */
const updateInferredCategoriesForUser = async (subscriberId, blogId) => {
    const subscriber = await Subscriber.findById(subscriberId);
    const blog = await Blog.findById(blogId);

    if (!subscriber || !blog) {
        throw new Error('Subscriber or Blog not found.');
    }

    // 1. Gather all relevant terms (category and tags) from the blog post.
    let relevantTerms = [];
    if (blog.category) {
        relevantTerms.push(blog.category);
    }
    if (blog.tags && Array.isArray(blog.tags)) {
        relevantTerms = [...relevantTerms, ...blog.tags];
    }

    // 2. Get the subscriber's current list of inferred categories.
    const currentCategories = subscriber.inferredCategories || [];

    // 3. Merge the new terms with the existing ones, ensuring there are no duplicates.
    const updatedCategories = [
        ...new Set([...currentCategories, ...relevantTerms])
    ];

    // 4. Save the updated array back to the database.
    subscriber.inferredCategories = updatedCategories;
    await subscriber.save();

    return subscriber.inferredCategories;
};


// @route   POST /api/subscribe
// @desc    Subscribe a new user to the newsletter
// @access  Public
const subscribe = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: 'Email is required.' });

    try {
        let subscriber = await Subscriber.findOne({ email: email.toLowerCase() });
        if (subscriber) {
            return res.status(200).json({ msg: 'You are already subscribed.', subscriberId: subscriber._id });
        }
        subscriber = new Subscriber({ email });
        await subscriber.save();
        res.status(201).json({ msg: 'Subscription successful!', subscriberId: subscriber._id });
    } catch (err) {
        console.error('Subscription error:', err);
        if (err.code === 11000) {
            return res.status(409).json({ msg: 'This email is already subscribed.' });
        }
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};

const trackLike = async (req, res) => {
    const { subscriberId, blogId } = req.body;
    if (!subscriberId || !blogId) return res.status(400).json({ msg: 'Subscriber ID and Blog ID are required.' });

    try {
        const updatedCategories = await updateInferredCategoriesForUser(subscriberId, blogId);
        res.status(200).json({ msg: 'Like behavior tracked successfully.', inferredCategories: updatedCategories });
    } catch (err) {
        console.error('Error tracking like:', err);
        res.status(500).json({ msg: 'Server Error tracking like.' });
    }
};

const trackComment = async (req, res) => {
    const { subscriberId, blogId } = req.body;
    if (!subscriberId || !blogId) return res.status(400).json({ msg: 'Subscriber ID and Blog ID are required.' });

    try {
        const updatedCategories = await updateInferredCategoriesForUser(subscriberId, blogId);
        res.status(200).json({ msg: 'Comment behavior tracked successfully.', inferredCategories: updatedCategories });
    } catch (err)
 {
        console.error('Error tracking comment:', err);
        res.status(500).json({ msg: 'Server Error tracking comment.' });
    }
};

const trackReadDuration = async (req, res) => {
    const { subscriberId, blogId } = req.body;
    if (!subscriberId || !blogId) return res.status(400).json({ msg: 'Subscriber ID and Blog ID are required.' });

    try {
        const updatedCategories = await updateInferredCategoriesForUser(subscriberId, blogId);
        res.status(200).json({ msg: `Read behavior tracked successfully.`, inferredCategories: updatedCategories });
    } catch (err) {
        console.error('Error tracking read duration:', err);
        res.status(500).json({ msg: 'Server Error tracking read duration.' });
    }
};

module.exports = {
    subscribe,
    trackLike,
    trackComment,
    trackReadDuration
};

