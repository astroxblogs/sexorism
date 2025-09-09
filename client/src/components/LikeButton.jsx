import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ThumbsUp } from 'lucide-react';
import { getSubscriberId } from '../utils/localStorage';
// --- FIX: Import the user tracking function directly into this component ---
import { trackUserLike } from '../services/api';

const LikeButton = ({ blogId, initialLikes = 0 }) => {
    const [likes, setLikes] = useState(initialLikes);
    const [liked, setLiked] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const fetchCorrectLikeCount = async () => {
            try {
                const res = await axios.get(`/api/blogs/${blogId}`);
                if (isMounted && res.data) {
                    setLikes(res.data.likes);
                }
            } catch (err) {
                console.error("Failed to fetch fresh like count:", err);
            }
        };

        fetchCorrectLikeCount();

        const likedBlogsJSON = localStorage.getItem('likedBlogs');
        const likedBlogs = likedBlogsJSON ? JSON.parse(likedBlogsJSON) : [];
        if (likedBlogs.includes(blogId)) {
            setLiked(true);
        }

        return () => { isMounted = false; };
    }, [blogId]);

    const handleLike = async () => {
        const newLikedState = !liked;
        const newLikesCount = newLikedState ? likes + 1 : Math.max(0, likes - 1);

        setLiked(newLikedState);
        setLikes(newLikesCount);
        setError(null);

        try {
            // --- STEP 1: Update the public like count ---
            const endpoint = newLikedState ? 'like' : 'unlike';
            await axios.post(`/api/blogs/${blogId}/${endpoint}`);

            const likedBlogsJSON = localStorage.getItem('likedBlogs');
            let likedBlogs = likedBlogsJSON ? JSON.parse(likedBlogsJSON) : [];
            if (newLikedState) {
                if (!likedBlogs.includes(blogId)) likedBlogs.push(blogId);
            } else {
                likedBlogs = likedBlogs.filter(id => id !== blogId);
            }
            localStorage.setItem('likedBlogs', JSON.stringify(likedBlogs));

            // --- STEP 2 (FIX): Trigger the personalization tracking from here ---
            // We only track when a user LIKES the post, not when they unlike.
            if (newLikedState) {
                const subscriberId = getSubscriberId();
                if (subscriberId) {
                    try {
                        // This will now be the ONLY place this tracking request is made.
                        await trackUserLike(subscriberId, blogId);
                    } catch (trackingError) {
                        console.error('Failed to track user like (non-critical):', trackingError);
                    }
                }
            }
        } catch (err) {
            // Revert UI on error
            setError(newLikedState ? 'Failed to like post.' : 'Failed to unlike post.');
            setLiked(!newLikedState);
            setLikes(newLikedState ? newLikesCount - 1 : newLikesCount + 1);

            const likedBlogsJSON = localStorage.getItem('likedBlogs');
            let likedBlogs = likedBlogsJSON ? JSON.parse(likedBlogsJSON) : [];
            if (newLikedState) {
                 likedBlogs = likedBlogs.filter(id => id !== blogId);
            } else {
                 if (!likedBlogs.includes(blogId)) likedBlogs.push(blogId);
            }
            localStorage.setItem('likedBlogs', JSON.stringify(likedBlogs));
        }
    };

    return (
        <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 transition-colors duration-200 ${liked
                ? 'text-blue-600 font-semibold hover:text-blue-700'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
            aria-label={liked ? "Unlike this post" : "Like this post"}
        >
            <ThumbsUp size={16} fill={liked ? 'currentColor' : 'none'} />
            <span>{likes}</span>
            {error && <span className="text-red-500 text-xs ml-2">{error}</span>}
        </button>
    );
};

export default LikeButton;

