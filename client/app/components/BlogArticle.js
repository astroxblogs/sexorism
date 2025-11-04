'use client'

import React, { Suspense } from 'react';
import Link from 'next/link';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { getVisitorId } from '../lib/localStorage';
// import LikeButton from './LikeButton.jsx';
import ShareButton from './ShareButton.jsx';
import TimedSubscriptionPopup from './TimedSubscriptionPopup.jsx';
// import AdSense from './AdSense'; // AD: domain-aware

const createSafeAltText = (text) => {
  if (!text) return '';
  return text.replace(/\b(image|photo|picture)\b/gi, '').replace(/\s\s+/g, ' ').trim();
};

const getLocalizedContent = (field, blogData, currentLang) => {
  const englishField = blogData[`${field}_en`];
  if (englishField && englishField.trim() !== '') return englishField;
  const localizedField = blogData[`${field}_${currentLang}`];
  if (localizedField && localizedField.trim() !== '') return localizedField;
  return blogData[field] || '';
};

const CommentSection = React.lazy(() => import('./CommentSection'));

const BlogArticle = ({
  blog,
  isSubscribed,
  setIsSubscribed,
  showGatedPopup,
  setShowGatedPopup,
  showTimedPopup,
  setShowTimedPopup,
  onTimedPopupSuccess,
  getShareCount,
  currentLang
}) => {
  const basePrefix = String(currentLang || '').startsWith('hi') ? '/hi' : '';
  const displayTitle = blog?.title ?? getLocalizedContent('title', blog, currentLang);
  const displayContent = blog?.content ?? getLocalizedContent('content', blog, currentLang);

  // Markdown -> HTML
  const rawContentHtml = marked.parse(displayContent);

  // Sanitization
  const purifier = DOMPurify;

  const ALLOWED_IFRAME_SRC = [
    /^https:\/\/www\.youtube-nocookie\.com\/embed\//i,
    /^https:\/\/player\.vimeo\.com\/video\//i,
  ];
  const ALLOWED_VIDEO_SRC = [/^https?:\/\//i, /^blob:/i];

  purifier.addHook('uponSanitizeElement', (node, data) => {
    if (data.tagName === 'iframe') {
      const src = node.getAttribute('src') || '';
      const ok = ALLOWED_IFRAME_SRC.some(re => re.test(src));
      if (!ok) {
        node.parentNode && node.parentNode.removeChild(node);
        return;
      }
      node.setAttribute('loading', 'lazy');
      node.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      node.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
      node.setAttribute('allowfullscreen', 'true');
      node.classList.add('ql-video');
    }

    if (data.tagName === 'video') {
      const src = node.getAttribute('src') || '';
      const ok = src && ALLOWED_VIDEO_SRC.some(re => re.test(src));
      if (!ok) {
        node.parentNode && node.parentNode.removeChild(node);
        return;
      }
      node.setAttribute('controls', '');
      node.setAttribute('playsinline', '');
      node.setAttribute('preload', 'metadata');
      node.classList.add('ql-html5video');
    }
  });

  const cleanContentHtml = purifier.sanitize(rawContentHtml, {
    ADD_TAGS: ['iframe', 'video', 'source'],
    ADD_ATTR: [
      'allow', 'allowfullscreen', 'frameborder', 'src', 'title', 'width', 'height', 'referrerpolicy', 'loading', 'class',
      'controls', 'playsinline', 'muted', 'poster', 'preload', 'src', 'type'
    ],
  });
  purifier.removeHook('uponSanitizeElement');

  const coverImage = blog.image?.trim() || 'https://placehold.co/800x400/666/fff?text=No+Image';
  const cleanAltTitle = createSafeAltText(displayTitle);
  const visitorId = getVisitorId();

  const categorySlug = (blog.category || 'uncategorized')
    .toString().trim().toLowerCase()
    .replace(/&/g, ' and ').replace(/\s+/g, ' ')
    .replace(/\s/g, '-').replace(/-+/g, '-');

  const postPath = `${basePrefix}/${categorySlug}/${blog.slug}`;

  return (
    <>
      <style>{`
        .blog-post-content iframe,
        .blog-post-content .ql-video,
        .blog-post-content video,
        .blog-post-content .ql-html5video {
          display: block;
          width: 100%;
          max-width: 720px;
          height: auto;
          aspect-ratio: 16 / 9;
          margin: 1rem auto;
          border-radius: 0.75rem;
        }
      `}</style>

      <article className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-xl p-4 sm:p-6 md:p-8 mt-4 md:mt-8 mb-8 relative">
        <div className="w-full h-55 flex items-center justify-center bg-gray-100">
          <img src={coverImage} alt={cleanAltTitle} className="w-full h-auto object-contain rounded-lg" loading="lazy" />
        </div>

        <div className="mb-3 md:mb-4">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-semibold text-gray-900 dark:text-white leading-tight">
            {displayTitle}
          </h1>
        </div>

        {/* AD: Article Top Banner */}
        {/* <div className="my-4 empty:hidden">
          <AdSense slot="article_top_banner" className="ad-slot ad-slot--leaderboard w-full" />
        </div> */}

        <div className="flex flex-wrap gap-x-3 gap-y-1 items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6 md:mb-8">
          <span>Published on: {blog.date ? new Date(blog.date).toLocaleDateString() : 'Invalid Date'}</span>

          {/* likes hidden earlier */}

          {/* ⛔️ TEMP: hide comments count in meta row */}
          {/*
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.08-3.242A8.877 8.877 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM4.72 14.48A6.879 6.879 0 008 15c3.314 0 6-2.686 6-6s-2.686-6-6-6a6.879 6.879 0 00-3.28.52l.995 2.985A.5.5 0 016 7h.5a.5.5 0 01.5.5v.5a.5.5 0 01-.5.5h-.5a.5.5 0 01-.5-.5v-.5a.5.5 0 01.3-.464L4.72 14.48z" clipRule="evenodd"></path>
            </svg>
            {blog.comments?.length || 0}
          </span>
          */}

          {/* views hidden earlier */}

          <ShareButton
            blogId={blog._id}
            blogSlug={blog.slug}
            title={blog.title}
            url={typeof window !== "undefined" ? `${window.location.origin}${postPath}` : ""}
            initialShareCount={getShareCount(blog._id)}
            showCountOnIcon={false}  // ⛔️ TEMP: do not show share count
          />
        </div>

        <div className="relative">
          <div className="prose prose-base sm:prose-lg lg:prose-xl dark:prose-invert max-w-none mb-6 md:mb-8 prose-img:rounded-xl prose-img:max-h-[400px] prose-img:mx-auto blog-post-content">
            <div dangerouslySetInnerHTML={{ __html: cleanContentHtml }} />
          </div>
        </div>

        {/* AD: Article Inline */}
        {/* <div className="my-6 empty:hidden">
          <AdSense slot="article_inline_1" className="ad-slot ad-slot--in-article w-full" />
        </div> */}

        {showGatedPopup && (
          <TimedSubscriptionPopup
            showPopup={showGatedPopup}
            onClose={() => setShowGatedPopup(false)}
            onSubscribeSuccess={() => { setIsSubscribed(true); setShowGatedPopup(false); }}
          />
        )}
        {showTimedPopup && !isSubscribed && (
          <TimedSubscriptionPopup
            showPopup={showTimedPopup}
            onClose={() => setShowTimedPopup(false)}
            onSubscribeSuccess={onTimedPopupSuccess}
          />
        )}

        {/* AD: Article Bottom */}
        {/* <div className="my-6 empty:hidden">
          <AdSense slot="article_bottom" className="ad-slot ad-slot--rectangle w-full" />
        </div> */}

        <div className="border-t dark:border-gray-700 pt-6">
          {/* Like button block hidden earlier */}

          <Suspense fallback={<div className="text-center py-10 dark:text-gray-400">Loading comments...</div>}>
            <CommentSection
              blogId={blog._id}
              initialComments={blog.comments}
              visitorId={visitorId}
            />
          </Suspense>
        </div>
      </article>
    </>
  );
};

export default BlogArticle;
