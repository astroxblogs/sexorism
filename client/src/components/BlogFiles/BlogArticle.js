import React, { Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async'; // Corrected import from react-helmet to react-helmet-async
import DOMPurify from 'dompurify';
import { marked } from 'marked';

import LikeButton from '../LikeButton.jsx';
import ShareButton from '../ShareButton.jsx';

import TimedSubscriptionPopup from '../TimedSubscriptionPopup.jsx';

// Helper functions
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

// Lazy loaded components with corrected path
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
    handleTrackComment,
    getShareCount,
    currentLang
}) => {
    
    // Content Processing
    const displayTitle = getLocalizedContent('title', blog, currentLang);
    const displayContent = getLocalizedContent('content', blog, currentLang);
    const rawContentHtml = marked.parse(displayContent);
    const cleanContentHtml = DOMPurify.sanitize(rawContentHtml);
    
    const contentToDisplay = cleanContentHtml;

    const coverImage = blog.image && blog.image.trim() !== '' ? blog.image.trim() : 'https://placehold.co/800x400/666/fff?text=No+Image';
    const cleanAltTitle = createSafeAltText(displayTitle);
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = marked.parse(displayContent);
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    const metaDescription = textContent.substring(0, 155).trim() + '...';

    return (
        <>
            <Helmet>
                {/* Basic Meta Tags */}
                <title>{`${displayTitle} - Innvibs | Innovation & Ideas Hub`}</title>
                <meta name="description" content={metaDescription} />
                <meta name="keywords" content={`${blog.tags?.join(', ') || ''}, innvibs, innovation, technology, ideas`} />
                <meta name="author" content="Innvibs" />
                
                {/* Open Graph / Facebook */}
                <meta property="og:type" content="article" />
                <meta property="og:site_name" content="Innvibs" />
                <meta property="og:title" content={`${displayTitle} | Innvibs`} />
                <meta property="og:description" content={metaDescription} />
                <meta property="og:image" content={coverImage} />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:image:alt" content={cleanAltTitle} />
                <meta property="og:url" content={`https://www.innvibs.com/blog/${blog.slug}`} />
                <meta property="og:locale" content="en_US" />
                
                {/* Article specific Open Graph */}
                <meta property="article:published_time" content={blog.date} />
                <meta property="article:author" content="Innvibs Team" />
                <meta property="article:section" content={blog.category || 'Technology'} />
                {blog.tags?.map(tag => (
                    <meta key={tag} property="article:tag" content={tag} />
                ))}
                
                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content="@innvibs" /> {/* Add your Twitter handle if you have one */}
                <meta name="twitter:creator" content="@innvibs" />
                <meta name="twitter:title" content={`${displayTitle} | Innvibs`} />
                <meta name="twitter:description" content={metaDescription} />
                <meta name="twitter:image" content={coverImage} />
                <meta name="twitter:image:alt" content={cleanAltTitle} />
                
                {/* Additional SEO */}
                <link rel="canonical" href={`https://www.innvibs.com/blog/${blog.slug}`} />
                <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
                
                {/* Schema.org structured data */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BlogPosting",
                        "headline": displayTitle,
                        "description": metaDescription,
                        "image": {
                            "@type": "ImageObject",
                            "url": coverImage,
                            "width": 1200,
                            "height": 630
                        },
                        "author": {
                            "@type": "Organization",
                            "name": "Innvibs"
                        },
                        "publisher": {
                            "@type": "Organization",
                            "name": "Innvibs",
                            "logo": {
                                "@type": "ImageObject",
                                "url": "https://www.innvibs.com/logo.png" // Add your logo URL
                            }
                        },
                        "datePublished": blog.date,
                        "dateModified": blog.updatedAt || blog.date,
                        "mainEntityOfPage": {
                            "@type": "WebPage",
                            "@id": `https://www.innvibs.com/blog/${blog.slug}`
                        },
                        "keywords": blog.tags?.join(', ') || '',
                        "articleSection": blog.category || 'Technology',
                        "url": `https://www.innvibs.com/blog/${blog.slug}`
                    })}
                </script>
            </Helmet>

            <article className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-xl p-4 sm:p-6 md:p-8 mt-4 md:mt-8 mb-8 relative">
                <div className="w-full h-55 flex items-center justify-center bg-gray-100">
                    <img src={coverImage} alt={cleanAltTitle} className="w-full h-auto object-contain rounded-lg" loading="lazy"/>
                </div>
                <div className="mb-3 md:mb-4">
                    <h1 className="text-2xl sm:text-3xl md:text-5xl font-semibold text-gray-900 dark:text-white leading-tight" style={{ fontFamily: 'Arial, sans-serif' }}>{displayTitle}</h1>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6 md:mb-8">
                    <span>Published on: {blog.date ? new Date(blog.date).toLocaleDateString() : 'Invalid Date'}</span>
                    <span className="flex items-center gap-1"><svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.562 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.865.802V10.333z"></path></svg>{blog.likes || 0}</span>
                    <span className="flex items-center gap-1"><svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.08-3.242A8.877 8.877 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM4.72 14.48A6.879 6.879 0 008 15c3.314 0 6-2.686 6-6s-2.686-6-6-6a6.879 6.879 0 00-3.28.52l.995 2.985A.5.5 0 016 7h.5a.5.5 0 01.5.5v.5a.5.5 0 01-.5.5h-.5a.5.5 0 01-.5-.5v-.5a.5.5 0 01.3-.464L4.72 14.48z" clipRule="evenodd"></path></svg>{blog.comments?.length || 0}</span>
                    <span className="flex items-center gap-1"><svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>{blog.views || 0}</span>
                    <ShareButton blogId={blog._id} blogSlug={blog.slug} title={blog.title} url={typeof window !== "undefined" ? `${window.location.origin}/blog/${blog.slug}` : ""} initialShareCount={getShareCount(blog._id)}/>
                </div>
                
                <div className="relative">
                    <div className="prose prose-base sm:prose-lg lg:prose-xl dark:prose-invert max-w-none mb-6 md:mb-8 prose-img:rounded-xl prose-img:max-h-[400px] prose-img:mx-auto blog-post-content">
                        <div dangerouslySetInnerHTML={{ __html: contentToDisplay }} />
                    </div>
                </div>

                {showGatedPopup && (
                    <TimedSubscriptionPopup 
                        showPopup={showGatedPopup} 
                        onClose={() => setShowGatedPopup(false)} 
                        onSubscribeSuccess={() => { 
                            setIsSubscribed(true); 
                            setShowGatedPopup(false); 
                        }}
                    />
                )}

                {showTimedPopup && !isSubscribed && (
                    <TimedSubscriptionPopup 
                        showPopup={showTimedPopup} 
                        onClose={() => setShowTimedPopup(false)} 
                        onSubscribeSuccess={onTimedPopupSuccess}
                    />
                )}

                <div className="flex flex-wrap gap-2 mb-6 md:mb-8">
                    {blog.tags?.map((tag) => (
                        <Link 
                            key={tag} 
                            to={`/tag/${encodeURIComponent(tag.toLowerCase())}`} 
                            className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 text-sm font-medium rounded-full hover:bg-blue-200 dark:hover:bg-blue-600 hover:text-blue-700 dark:hover:text-blue-100 transition-colors cursor-pointer"
                        >
                            #{tag}
                        </Link>
                    ))}
                </div>
                
                <div className="border-t dark:border-gray-700 pt-6">
                    <div className="mb-8">
                        {isSubscribed ? (
                            <LikeButton blogId={blog._id} initialLikes={blog.likes}/>
                        ) : (
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Subscribe to like this post!</p>
                        )}
                    </div>
                    <Suspense fallback={<div className="text-center py-10 dark:text-gray-400">Loading comments...</div>}>
                        {isSubscribed ? (
                            <CommentSection 
                                blogId={blog._id} 
                                initialComments={blog.comments} 
                                onCommentSuccess={handleTrackComment}
                            />
                        ) : (
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Subscribe to view and post comments!</p>
                        )}
                    </Suspense>
                </div>
            </article>
        </>
    );
};

export default BlogArticle;

