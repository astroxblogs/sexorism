const Subscriber = require('../models/Subscriber');
const Blog = require('../models/Blog');

/**
 * A more robust helper function to update a subscriber's inferred categories.
 * This version uses atomic database operations to prevent common errors.
 * @param {string} subscriberId - The ID of the subscriber.
 * @param {string} blogId - The ID of the blog.
 */
const updateInferredCategoriesForUser = async (subscriberId, blogId) => {
    // 1. First, find the blog to get its category and tags.
    const blog = await Blog.findById(blogId).lean(); // .lean() makes it faster as we only need to read data

    if (!blog) {
        throw new Error('Blog not found.');
    }

    // 2. Gather all relevant terms from the blog post.
    let relevantTerms = [];
    if (blog.category) {
        relevantTerms.push(blog.category);
    }
    if (blog.tags && Array.isArray(blog.tags)) {
        relevantTerms = [...relevantTerms, ...blog.tags];
    }

    // If there are no terms to add, we can stop here.
    if (relevantTerms.length === 0) {
        return;
    }

    // --- THIS IS THE FIX ---
    // Instead of finding, modifying, and saving the subscriber, we perform a single,
    // atomic update operation. The `$addToSet` operator tells MongoDB to add elements
    // to the 'inferredCategories' array, but only if they are not already present.
    // This is much more reliable and efficient than the previous method.
    await Subscriber.findByIdAndUpdate(subscriberId, {
        $addToSet: { inferredCategories: { $each: relevantTerms } }
    });
};


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
        await updateInferredCategoriesForUser(subscriberId, blogId);
        // Since the operation was successful, we find the updated document to send back.
        const updatedSubscriber = await Subscriber.findById(subscriberId).lean();
        res.status(200).json({ msg: 'Like behavior tracked successfully.', inferredCategories: updatedSubscriber.inferredCategories || [] });
    } catch (err) {
        console.error('Error tracking like:', err);
        res.status(500).json({ msg: err.message || 'Server Error tracking like.' });
    }
};

const trackComment = async (req, res) => {
    const { subscriberId, blogId } = req.body;
    if (!subscriberId || !blogId) return res.status(400).json({ msg: 'Subscriber ID and Blog ID are required.' });

    try {
        await updateInferredCategoriesForUser(subscriberId, blogId);
        const updatedSubscriber = await Subscriber.findById(subscriberId).lean();
        res.status(200).json({ msg: 'Comment behavior tracked successfully.', inferredCategories: updatedSubscriber.inferredCategories || [] });
    } catch (err) {
        console.error('Error tracking comment:', err);
        res.status(500).json({ msg: err.message || 'Server Error tracking comment.' });
    }
};

const trackReadDuration = async (req, res) => {
    const { subscriberId, blogId } = req.body;
    if (!subscriberId || !blogId) return res.status(400).json({ msg: 'Subscriber ID and Blog ID are required.' });

    try {
        await updateInferredCategoriesForUser(subscriberId, blogId);
        const updatedSubscriber = await Subscriber.findById(subscriberId).lean();
        res.status(200).json({ msg: `Read behavior tracked successfully.`, inferredCategories: updatedSubscriber.inferredCategories || [] });
    } catch (err) {
        console.error('Error tracking read duration:', err);
        res.status(500).json({ msg: err.message || 'Server Error tracking read duration.' });
    }
};

module.exports = {
    subscribe,
    trackLike,
    trackComment,
    trackReadDuration
};

