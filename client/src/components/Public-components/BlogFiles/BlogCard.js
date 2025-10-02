import React, { useEffect } from "react";
import { Link } from "react-router-dom";
// import { marked } from "marked";
import LikeButton from '../LikeButton.jsx';
import { MessageSquare, Eye } from "lucide-react";
import ShareButton from "../ShareButton.jsx";
import { useTranslation } from "react-i18next";
import { getCategoryClasses } from "../../../utils/Public-utils/categoryColors.js";
import { useShare } from "../../../context/ShareContext.js";

const slugify = (text) => {
    return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-&]/g, '').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
};

const tagSlugify = (tag) => {
    return tag.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
};

const BlogCard = ({ blog, onLikeUpdate, searchQuery, visitorId }) => {
    const { i18n, t } = useTranslation();
    const currentLang = i18n.language;
    const { setInitialShareCount } = useShare();

    useEffect(() => {
        if (blog?._id && blog.shareCount !== undefined) {
            setInitialShareCount(blog._id, blog.shareCount);
        }
    }, [blog, setInitialShareCount]);

    const getLocalizedField = (field) => {
        const localizedField = blog[`${field}_${currentLang}`];
        // Check for non-empty string for content fields
        if (localizedField && localizedField.trim() !== '') return localizedField;

        const englishField = blog[`${field}_en`];
        if (englishField && englishField.trim() !== '') return englishField;
        
        // Fallback for older single-language fields
        return blog[field] || "";
    };

    const displayTitle = getLocalizedField("title");
    
    // ✅ --- START OF THE FIX ---

    // 1. Get the localized excerpt first.
    const displayExcerpt = getLocalizedField("excerpt");
    
    // 2. Fallback to main content only if the excerpt is missing.
    const displayContent = getLocalizedField("content");
    
    const getPlainTextSummary = (content) => {
        if (!content) return "";
        // Simple HTML tag removal regex for the fallback content
        const plainText = content.replace(/<[^>]+>/g, ''); 
        return plainText.slice(0, 150) + (plainText.length > 150 ? "..." : "");
    };

    // 3. Decide which text to show: the excerpt if it exists, otherwise a snippet of the content.
    const summary = displayExcerpt ? displayExcerpt : getPlainTextSummary(displayContent);

    // ✅ --- END OF THE FIX ---


    const highlightSearchTerms = (text, searchQuery) => {
        if (!searchQuery || !text) return text;
        const searchTerms = searchQuery.trim().split(/\s+/);
        let highlightedText = text;
        searchTerms.forEach(term => {
            if (term.length > 0) {
                const regex = new RegExp(`(${term})`, 'gi');
                highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>');
            }
        });
        return highlightedText;
    };

    const generateBlogUrl = () => {
        const categorySlug = blog.category ? slugify(blog.category) : 'uncategorized';
        const blogSlug = blog.slug || blog._id;
        return `/category/${categorySlug}/${blogSlug}`;
    };

    const blogUrl = generateBlogUrl();

    return (
        <div className="flex flex-col sm:flex-row items-stretch bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow transition overflow-visible w-full">
            {blog.image && (
                <Link
                    to={blogUrl}
                    className="w-full aspect-[16/9] sm:w-40 md:w-48 sm:aspect-auto sm:self-stretch flex-shrink-0 overflow-hidden group"
                >
                    <img
                        src={blog.image}
                        alt={displayTitle}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                    />
                </Link>
            )}
            
            <div className="flex-1 p-3 sm:p-4 flex flex-col min-w-0">
                
                <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2 flex-wrap text-[11px] text-gray-500 mb-1">
                        {blog.category && (
                            <span
                                className={`px-2 py-0.5 rounded-full ${getCategoryClasses(
                                    blog.category
                                )}`}
                            >
                                {t(
                                    `category.${String(blog.category).toLowerCase().replace(/ & /g, "_").replace(/\s+/g, "_").replace(/&/g, "_")}`,
                                    { defaultValue: blog.category }
                                )}
                            </span>
                        )}
                        <span className="text-gray-500 dark:text-gray-400">
                            {new Date(blog.date).toLocaleDateString()}
                        </span>
                    </div>

                    <Link to={blogUrl} className="block">
                        <h2
                            className="text-sm sm:text-lg md:text-xl font-semibold leading-snug text-gray-900 dark:text-gray-100 hover:underline line-clamp-2"
                            dangerouslySetInnerHTML={{
                                __html: searchQuery ? highlightSearchTerms(displayTitle, searchQuery) : displayTitle
                            }}
                        />
                    </Link>

                    {blog.tags && blog.tags.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1.5">
                            {blog.tags.slice(0, 3).map((tag) => (
                                <Link
                                    key={tag}
                                    to={`/tag/${tagSlugify(tag)}`}
                                    className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                >
                                    #{tag}
                                </Link>
                            ))}
                        </div>
                    )}
                    
                    {/* ✅ FIX: Use the new 'summary' variable here */}
                    <p
                        className="mt-1.5 text-sm text-gray-600 dark:text-gray-400 line-clamp-2 break-words"
                        dangerouslySetInnerHTML={{
                            __html: searchQuery ? highlightSearchTerms(summary, searchQuery) : summary
                        }}
                    />
                </div>

                <div className="mt-auto pt-2 flex items-center gap-4 sm:gap-5 text-gray-500 dark:text-gray-400 text-[11px] sm:text-xs">
                    <LikeButton
                        blogId={blog._id}
                        initialLikes={blog.likedBy?.length || 0}
                        initialLiked={blog.likedBy?.includes(visitorId)}
                        visitorId={visitorId}
                    />
                    <Link
                        to={`${blogUrl}#comments`}
                        className="flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-white"
                    >
                        <MessageSquare size={14} />
                        <span>{blog.comments?.length || 0}</span>
                    </Link>
                    <ShareButton
                        title={displayTitle}
                        url={
                            typeof window !== "undefined"
                                ? `${window.location.origin}${blogUrl}`
                                : ""
                        }
                        blogId={blog._id}
                        blogSlug={blog.slug}
                        variant="icon"
                        showCountOnIcon={true}
                        className="relative z-20 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    />

                    <span className="ml-auto flex items-center gap-1.5">
                        <Eye size={14} />
                        <span>{blog.views || 0}</span>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default BlogCard;