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

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
          background: linear-gradient(to right, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
          background-size: 1000px 100%;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      <article
        className="
    w-full max-w-3xl mx-auto
    bg-[var(--color-bg-secondary)]
   dark:bg-gradient-to-br from-black/40 to-purple-900/20
    rounded-2xl shadow-2xl
    border border-light-border dark:border-white/10
    p-4 sm:p-6 md:p-10
    mt-4 md:mt-8 mb-8
    relative overflow-hidden
    backdrop-blur-sm
    transition-shadow duration-500
    hover:shadow-purple-500/10
  "
      >
        {/* Decorative animated background elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 opacity-80"></div>

        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
          <div
            className="absolute top-40 right-10 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-float"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-20 left-1/3 w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl animate-float"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="relative z-10">
          {/* Title Section with modern styling */}

          <div className="mb-6 md:mb-8 animate-fade-in">
            <h1
              className="
    text-3xl sm:text-4xl md:text-5xl lg:text-6xl
    font-bold
    text-[var(--color-text-primary)]
    leading-tight mb-4
    transform transition-all duration-300 hover:scale-[1.01]
  "
            >
              <span className="tracking-tight">{displayTitle}</span>
            </h1>

            {/* Decorative line under title */}
            <div className="w-24 h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full transform transition-all duration-300 hover:w-32"></div>
          </div>

          {/* Meta Information with enhanced design */}
          <div
            className="
              flex flex-wrap gap-4 items-center text-xs sm:text-sm
              mb-6 md:mb-8 p-4
              bg-[var(--color-bg-secondary)]/80
              rounded-xl backdrop-blur-sm
              border border-light-border shadow-sm
              text-[var(--color-text-secondary)]
            "
          >
            <div className="flex items-center gap-2 font-medium group">
              <svg
                className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>
                {blog.date
                  ? new Date(blog.date).toLocaleDateString()
                  : "Invalid Date"}
              </span>
            </div>

            <div className="flex items-center">
              <ShareButton
                blogId={blog._id}
                blogSlug={blog.slug}
                title={blog.title}
                url={
                  typeof window !== "undefined"
                    ? `${window.location.origin}${postPath}`
                    : ""
                }
                initialShareCount={getShareCount(blog._id)}
                showCountOnIcon={false}
              />
            </div>
          </div>

          {/* Cover Image with modern effects */}
          <div className="relative mb-8 md:mb-10 group overflow-hidden rounded-2xl shadow-2xl border-4 border-white/10 dark:border-white/5">
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
            <img
              src={coverImage}
              alt={cleanAltTitle}
              className="w-full h-auto object-cover rounded-xl transform transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            {/* Shimmer effect overlay */}
            <div className="absolute inset-0 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>

          {/* Content Section with enhanced typography */}
          <div className="relative">
            <div
              className="
    prose prose-base sm:prose-lg lg:prose-xl
    max-w-none mb-6 md:mb-8
    prose-img:rounded-2xl prose-img:shadow-xl prose-img:max-h-[500px] prose-img:mx-auto
    prose-headings:text-[var(--color-text-primary)] prose-headings:font-bold
    prose-p:text-[var(--color-text-primary)] prose-p:leading-relaxed
    prose-li:text-[var(--color-text-primary)] prose-ul:text-[var(--color-text-primary)] prose-ol:text-[var(--color-text-primary)]
    prose-a:text-[var(--color-accent)] prose-a:no-underline hover:prose-a:underline
    prose-strong:text-[var(--color-text-primary)]
    prose-code:text-[var(--color-accent)]
    prose-code:bg-[var(--color-bg-secondary)]
    prose-code:px-1 prose-code:py-0.5 prose-code:rounded
    blog-post-content
  "
            >
              <div dangerouslySetInnerHTML={{ __html: cleanContentHtml }} />
            </div>
          </div>


          {/* Comments Section with modern styling */}
          <div className="mt-12 pt-8 border-t border-light-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.08-3.242A8.877 8.877 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
                Conversations
              </h2>
            </div>

            <Suspense
              fallback={
                <div className="text-center py-16">
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-[var(--color-bg-secondary)] rounded-full">
                    <svg
                      className="animate-spin h-5 w-5 text-[var(--color-accent)]"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                      Loading comments...
                    </span>
                  </div>
                </div>
              }
            >
              <CommentSection
                blogId={blog._id}
                initialComments={blog.comments}
                visitorId={visitorId}
              />
            </Suspense>
          </div>
        </div>

        {/* Decorative corner elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-400/10 to-transparent rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-pink-400/10 to-transparent rounded-tr-full"></div>
      </article>
    </>
  );
};

export default BlogArticle;
