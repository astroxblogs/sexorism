'use client'

import React, { useState, useEffect } from 'react';
import { ThumbsUp } from 'lucide-react';
import { likePost, unlikePost } from '../lib/api';

// ✅ STEP 1: Import the custom hook for our global state
import { useBlogs } from '../context/BlogContext';

const LikeButton = ({ blogId, initialLikes = 0, initialLiked = false, visitorId }) => {
    // ✅ STEP 2: Get the global update function from the context
    const { updateBlog } = useBlogs();

    const [likes, setLikes] = useState(initialLikes);
    const [liked, setLiked] = useState(initialLiked);
    const [error, setError] = useState(null);

    // This useEffect ensures the button's state is in sync with the latest data from its parent
    useEffect(() => {
        setLikes(initialLikes);
        setLiked(initialLiked);
    }, [initialLikes, initialLiked]);

    const handleLike = async () => {
        const newLikedState = !liked;
        // Optimistic UI update
        setLiked(newLikedState);
        setLikes(prevLikes => newLikedState ? prevLikes + 1 : prevLikes - 1);
        setError(null);

        try {
            let response;
            if (newLikedState) {
                response = await likePost(blogId, visitorId);
            } else {
                response = await unlikePost(blogId, visitorId);
            }

            // ✅ STEP 3: After a successful API call, update the global state
            if (response && response.blog) {
                updateBlog(response.blog);
            }

        } catch (err) {
            // Revert UI on error
            setError('An error occurred.');
            setLiked(!newLikedState);
            setLikes(prevLikes => newLikedState ? prevLikes - 1 : prevLikes + 1);
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
