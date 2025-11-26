'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useBlogs } from '../context/BlogContext';
import { useShare } from '../context/ShareContext';
import { hasSubscriberId } from '../utils/localStorage';
// import { incrementBlogView } from '../lib/api'; // ⛔️ TEMP DISABLED: view counter
import BlogArticle from './BlogArticle';
import TimedSubscriptionPopup from './TimedSubscriptionPopup.jsx';

const POPUP_DELAY_SECONDS = 60;

const BlogDetail = ({ blog }) => {
  const { i18n } = useTranslation();
  const lang = i18n?.resolvedLanguage || i18n?.language || 'en';

  const { updateBlog } = useBlogs();
  const { getShareCount, setInitialShareCount } = useShare();

  const [isSubscribed, setIsSubscribed] = useState(hasSubscriberId());
  const [showTimedPopup, setShowTimedPopup] = useState(false);
  const timerRef = useRef(null);
  // const processedBlogId = useRef(null); // ⛔️ TEMP DISABLED: used only for views

  const localizedBlog = blog
    ? {
        ...blog,
        title:   blog?.[`title_${lang}`]   ?? blog?.title_en   ?? blog?.title,
        excerpt: blog?.[`excerpt_${lang}`] ?? blog?.excerpt_en ?? blog?.excerpt,
        content: blog?.[`content_${lang}`] ?? blog?.content_en ?? blog?.content,
        tags:    blog?.[`tags_${lang}`]    ?? blog?.tags,
        lang,
      }
    : blog;

  // keep context in sync (unchanged)
  useEffect(() => {
    if (blog && updateBlog) {
      updateBlog(blog);
    }
  }, [blog, updateBlog]);

  // ⛔️ TEMP DISABLED: increment view logic
  /*
  useEffect(() => {
    if (!blog || !blog._id || processedBlogId.current === blog._id) return;
    const COOLDOWN_PERIOD = 60 * 60 * 1000;
    const now = Date.now();
    try {
      const viewedBlogs = JSON.parse(localStorage.getItem('viewedBlogs')) || {};
      const lastViewed = viewedBlogs[blog._id];
      if (!lastViewed || now - lastViewed > COOLDOWN_PERIOD) {
        viewedBlogs[blog._id] = now;
        localStorage.setItem('viewedBlogs', JSON.stringify(viewedBlogs));
        incrementBlogView(blog._id);
      }
      processedBlogId.current = blog._id;
    } catch (e) {
      console.error('Error handling blog view logic:', e);
    }
  }, [blog]);
  */

  // timed popup (unchanged)
  useEffect(() => {
    if (!isSubscribed && blog && !showTimedPopup) {
      timerRef.current = setTimeout(() => {
        setShowTimedPopup(true);
      }, POPUP_DELAY_SECONDS * 1000);
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [blog, isSubscribed, showTimedPopup]);

  // share count init (unchanged)
  useEffect(() => {
    if (blog?._id && blog.shareCount !== undefined) {
      setInitialShareCount(blog._id, blog.shareCount);
    }
  }, [blog, setInitialShareCount]);

  const handleTimedPopupSuccess = useCallback(() => {
    setIsSubscribed(true);
    setShowTimedPopup(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  if (!blog) return <div className="text-center mt-20 p-4 dark:text-gray-300">Blog not found.</div>;

  return (
    <>
      <BlogArticle
        key={lang}
        blog={localizedBlog}
        isSubscribed={isSubscribed}
        setIsSubscribed={setIsSubscribed}
        getShareCount={getShareCount}
        currentLang={lang}
      />

      {/* Render popup at page level to avoid clipping */}
      {showTimedPopup && !isSubscribed && (
        <TimedSubscriptionPopup
          showPopup={showTimedPopup}
          onClose={() => setShowTimedPopup(false)}
          onSubscribeSuccess={handleTimedPopupSuccess}
        />
      )}
    </>
  );
};

export default BlogDetail;
