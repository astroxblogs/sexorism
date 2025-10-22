'use client'

import React, { useEffect, memo } from "react";
import Link from "next/link";
import LikeButton from './LikeButton.jsx';
import { MessageSquare, Eye } from "lucide-react";
import ShareButton from "./ShareButton.jsx";
import { useTranslation } from "react-i18next";
import { getCategoryClasses } from "../lib/categoryColors.js";
import { useShare } from "../context/ShareContext.js";
import { makeBlogLink } from '../lib/paths';

// UPDATED: Using the standardized toSlug function for consistency.
const toSlug = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/\s*&\s*/g, '-and-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const BlogCard = ({ blog, onLikeUpdate, searchQuery, visitorId }) => {
  const { i18n, t } = useTranslation();
  const currentLang = i18n?.resolvedLanguage || i18n?.language || 'en';
  const basePrefix = String(currentLang).toLowerCase().startsWith('hi') ? '/hi' : '';
  const locale = String(currentLang).toLowerCase().startsWith('hi') ? 'hi' : 'en';
  const { setInitialShareCount } = useShare();

  useEffect(() => {
    if (blog?._id && blog.shareCount !== undefined) {
      setInitialShareCount(blog._id, blog.shareCount);
    }
  }, [blog, setInitialShareCount]);

  const getLocalizedField = (field) => {
    const localized = blog?.[`${field}_${currentLang}`];
    if (localized && String(localized).trim() !== '') return localized;
    const english = blog?.[`${field}_en`];
    if (english && String(english).trim() !== '') return english;
    return blog?.[field] || '';
  };

  const displayTitle = getLocalizedField("title");
  const displayExcerpt = getLocalizedField("excerpt");
  const displayContent = getLocalizedField("content");

  const getPlainTextSummary = (content) => {
    if (!content) return "";
    const plainText = String(content).replace(/<[^>]+>/g, '');
    return plainText.slice(0, 150) + (plainText.length > 150 ? "..." : "");
  };

  const summary = displayExcerpt ? displayExcerpt : getPlainTextSummary(displayContent);

  const highlightSearchTerms = (text, q) => {
    if (!q || !text) return text;
    const searchTerms = q.trim().split(/\s+/);
    let highlightedText = text;
    searchTerms.forEach(term => {
      if (term.length > 0) {
        const regex = new RegExp(`(${term})`, 'gi');
        highlightedText = highlightedText.replace(
          regex,
          '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>'
        );
      }
    });
    return highlightedText;
  };

 const generateBlogUrl = () => {
    const categorySlug = blog?.category ? toSlug(blog.category) : 'uncategorized';
    const blogSlug = blog?.slug || blog?._id || '';
    return makeBlogLink(locale, categorySlug, blogSlug);
 };
  const blogUrl = generateBlogUrl();

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : '');

  return (
    <div key={currentLang} className="flex flex-col sm:flex-row items-stretch bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow transition overflow-visible w-full">
      <Link
        href={blogUrl}
        className="w-full aspect-[16/9] sm:w-40 md:w-48 sm:aspect-auto sm:self-stretch flex-shrink-0 overflow-hidden group"
      >
        <img
          src={blog?.image || "https://res.cloudinary.com/dsoeem7bp/image/upload/v1757753276/astroxhub_blog_images/default.webp"}
          alt={displayTitle}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            if (e?.target) {
              e.target.src = "https://res.cloudinary.com/dsoeem7bp/image/upload/v1757753276/astroxhub_blog_images/default.webp";
            }
          }}
        />
      </Link>

      <div className="flex-1 p-3 sm:p-4 flex flex-col min-w-0">
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-2 flex-wrap text-[11px] text-gray-500 mb-1">
            {blog?.category && (
              <span
                className={`px-2 py-0.5 rounded-full ${getCategoryClasses(blog.category)}`}
              >
                {t(
                  `category.${String(blog.category).toLowerCase().replace(/ & /g, "_").replace(/\s+/g, "_").replace(/&/g, "_")}`,
                  { defaultValue: blog.category }
                )}
              </span>
            )}
            <span className="text-gray-500 dark:text-gray-400">
              {blog?.date ? new Date(blog.date).toLocaleDateString() : ''}
            </span>
          </div>

          <Link href={blogUrl} className="block">
            <h2
              className="text-sm sm:text-lg md:text-xl font-semibold leading-snug text-gray-900 dark:text-gray-100 hover:underline line-clamp-2"
              dangerouslySetInnerHTML={{
                __html: searchQuery ? highlightSearchTerms(displayTitle, searchQuery) : displayTitle
              }}
            />
          </Link>

          <p
            className="mt-1.5 text-sm text-gray-600 dark:text-gray-400 line-clamp-2 break-words"
            dangerouslySetInnerHTML={{
              __html: searchQuery ? highlightSearchTerms(summary, searchQuery) : summary
            }}
          />
        </div>

        <div className="mt-auto pt-2 flex items-center gap-4 sm:gap-5 text-gray-500 dark:text-gray-400 text-[11px] sm:text-xs">
          <LikeButton
            blogId={blog?._id}
            initialLikes={Array.isArray(blog?.likedBy) ? blog.likedBy.length : 0}
            initialLiked={Array.isArray(blog?.likedBy) ? blog.likedBy.includes(visitorId) : false}
            visitorId={visitorId}
          />

          <Link
            href={`${blogUrl}#comments`}
            className="flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-white"
          >
            <MessageSquare size={14} />
            <span>{Array.isArray(blog?.comments) ? blog.comments.length : 0}</span>
          </Link>

          <ShareButton
            title={displayTitle}
            url={`${siteUrl}${blogUrl}`}
            blogId={blog?._id}
            blogSlug={blog?.slug}
            variant="icon"
            showCountOnIcon={true}
            className="relative z-20 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          />

          <span className="ml-auto flex items-center gap-1.5">
            <Eye size={14} />
            <span>{blog?.views || 0}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default memo(BlogCard);
