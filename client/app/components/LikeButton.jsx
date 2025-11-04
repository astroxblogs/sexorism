'use client'

import React from 'react';
// import { ThumbsUp } from 'lucide-react';                 // ⛔️ TEMP DISABLED: like UI
// import { likePost, unlikePost } from '../lib/api';       // ⛔️ TEMP DISABLED: like API
// import { useBlogs } from '../context/BlogContext';       // ⛔️ TEMP DISABLED: global update

// ⛔️ TEMP: Do not render the Like button at all.
// Keep the component and default export so imports elsewhere don't break.
const LikeButton = (/* { blogId, initialLikes = 0, initialLiked = false, visitorId } */) => {
  return null;
};

export default LikeButton;

/* 
// ─────────────────────────────────────────────────────────────────────────────
// Original implementation retained below for easy re-enable. Just uncomment the
// imports and this block, and replace the null-returning component above.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { ThumbsUp } from 'lucide-react';
import { likePost, unlikePost } from '../lib/api';
import { useBlogs } from '../context/BlogContext';

const LikeButton = ({ blogId, initialLikes = 0, initialLiked = false, visitorId }) => {
  const { updateBlog } = useBlogs();

  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initialLiked);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLikes(initialLikes);
    setLiked(initialLiked);
  }, [initialLikes, initialLiked]);

  const handleLike = async () => {
    const newLikedState = !liked;
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

      if (response && response.blog) {
        updateBlog(response.blog);
      }
    } catch (err) {
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
*/
