import React, { Suspense } from 'react';
import { Link } from 'react-router-dom';

import DOMPurify from 'dompurify';
import { marked } from 'marked';

// ✅ STEP 1: Import the new localStorage and API functions
import { getVisitorId } from '../../../utils/Public-utils/localStorage';


import LikeButton from '../LikeButton.jsx';
import ShareButton from '../ShareButton.jsx';
import TimedSubscriptionPopup from '../TimedSubscriptionPopup.jsx';

// Helper functions (no changes here)
const slugify = (text) => {
    return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-&]/g, '').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
};
const createSafeAltText = (text) => {
    if (!text) return '';
    return text.replace(/\b(image|photo|picture)\b/gi, '').replace(/\s\s+/g, ' ').trim();
};
const getLocalizedContent = (field, blogData, currentLang) => {
    const localizedField = blogData[`${field}_${currentLang}`];
    if (localizedField) return localizedField;
    if (blogData[`${field}_en`]) return blogData[`${field}_en`];
    return blogData[field] || '';
};

const CommentSection = React.lazy(() => import('../CommentSection'));

const BlogArticle = ({
    blog,
    isSubscribed,
    setIsSubscribed,
    showGatedPopup,
    setShowGatedPopup,
    showTimedPopup,
    setShowTimedPopup,
    onTimedPopupSuccess,
    // handleTrackComment prop is no longer needed in the same way, but kept for now
    handleTrackComment, 
    getShareCount,
    currentLang
}) => {
    
    // Content Processing (no changes here)
    const displayTitle = getLocalizedContent('title', blog, currentLang);
    const displayContent = getLocalizedContent('content', blog, currentLang);
    const rawContentHtml = marked.parse(displayContent);
    const cleanContentHtml = DOMPurify.sanitize(rawContentHtml);
    const contentToDisplay = cleanContentHtml;
    const coverImage = blog.image && blog.image.trim() !== '' ? blog.image.trim() : 'https://placehold.co/800x400/666/fff?text=No+Image';
    const cleanAltTitle = createSafeAltText(displayTitle);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = marked.parse(displayContent);
  
   

    // ✅ STEP 2: Get the anonymous visitor ID
    const visitorId = getVisitorId();

    return (
        <>
            

            <article className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-xl p-4 sm:p-6 md:p-8 mt-4 md:mt-8 mb-8 relative">
                <div className="w-full h-55 flex items-center justify-center bg-gray-100">
                    <img src={coverImage} alt={cleanAltTitle} className="w-full h-auto object-contain rounded-lg" loading="lazy"/>
                </div>
                <div className="mb-3 md:mb-4">
                    <h1 className="text-2xl sm:text-3xl md:text-5xl font-semibold text-gray-900 dark:text-white leading-tight" style={{ fontFamily: 'Arial, sans-serif' }}>{displayTitle}</h1>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6 md:mb-8">
                    <span>Published on: {blog.date ? new Date(blog.date).toLocaleDateString() : 'Invalid Date'}</span>
                    
                    {/* ✅ STEP 3: Update like count to use likedBy.length */}
                    <span className="flex items-center gap-1"><svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.562 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.865.802V10.333z"></path></svg>{blog.likedBy?.length || 0}</span>
                    
                    <span className="flex items-center gap-1"><svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.08-3.242A8.877 8.877 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM4.72 14.48A6.879 6.879 0 008 15c3.314 0 6-2.686 6-6s-2.686-6-6-6a6.879 6.879 0 00-3.28.52l.995 2.985A.5.5 0 016 7h.5a.5.5 0 01.5.5v.5a.5.5 0 01-.5.5h-.5a.5.5 0 01-.5-.5v-.5a.5.5 0 01.3-.464L4.72 14.48z" clipRule="evenodd"></path></svg>{blog.comments?.length || 0}</span>
                    <span className="flex items-center gap-1"><svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>{blog.views || 0}</span>
                    <ShareButton blogId={blog._id} blogSlug={blog.slug} title={blog.title} url={typeof window !== "undefined" ? `${window.location.origin}/category/${blog.category ? slugify(blog.category) : 'uncategorized'}/${blog.slug}` : ""} initialShareCount={getShareCount(blog._id)}/>
                </div>
                
                <div className="relative">
                    <div className="prose prose-base sm:prose-lg lg:prose-xl dark:prose-invert max-w-none mb-6 md:mb-8 prose-img:rounded-xl prose-img:max-h-[400px] prose-img:mx-auto blog-post-content">
                        <div dangerouslySetInnerHTML={{ __html: contentToDisplay }} />
                    </div>
                </div>

                {/* Popups (no changes here) */}
                {showGatedPopup && ( <TimedSubscriptionPopup showPopup={showGatedPopup} onClose={() => setShowGatedPopup(false)} onSubscribeSuccess={() => { setIsSubscribed(true); setShowGatedPopup(false); }} /> )}
                {showTimedPopup && !isSubscribed && ( <TimedSubscriptionPopup showPopup={showTimedPopup} onClose={() => setShowTimedPopup(false)} onSubscribeSuccess={onTimedPopupSuccess} /> )}

                <div className="flex flex-wrap gap-2 mb-6 md:mb-8">
                    {blog.tags?.map((tag) => (
                        <Link key={tag} to={`/tag/${encodeURIComponent(tag.toLowerCase())}`} className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 text-sm font-medium rounded-full hover:bg-blue-200 dark:hover:bg-blue-600 hover:text-blue-700 dark:hover:text-blue-100 transition-colors cursor-pointer">
                            #{tag}
                        </Link>
                    ))}
                </div>
                
                <div className="border-t dark:border-gray-700 pt-6">
                    <div className="mb-8">
                        {/* ✅ STEP 4: Always show the LikeButton and pass new props */}
                        <LikeButton 
                            blogId={blog._id} 
                            initialLikes={blog.likedBy?.length || 0} 
                            initialLiked={blog.likedBy?.includes(visitorId)}
                            visitorId={visitorId}
                        />
                    </div>
                    <Suspense fallback={<div className="text-center py-10 dark:text-gray-400">Loading comments...</div>}>
                        {/* ✅ STEP 5: Always show the CommentSection and pass new props */}
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