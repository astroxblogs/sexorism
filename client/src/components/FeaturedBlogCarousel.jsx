import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { marked } from 'marked';
import { useTranslation } from 'react-i18next';

const FeaturedBlogCarousel = ({ blogs }) => {
    const { i18n, t } = useTranslation();
    const currentLang = i18n.language;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [imageLoaded, setImageLoaded] = useState(false);

    const getLocalizedContent = (field, blogData, lang) => {
        const localizedField = blogData[`${field}_${lang}`];
        if (localizedField) {
            return localizedField;
        }
        if (blogData[`${field}_en`]) {
            return blogData[`${field}_en`];
        }
        return blogData[field] || '';
    };

    useEffect(() => {
        if (!blogs || blogs.length === 0) return;

        setImageLoaded(false);

        const img = new Image();
        img.src = blogs[currentIndex].image;
        img.onload = () => setImageLoaded(true);
        img.onerror = () => {
            console.error("Failed to load carousel image:", blogs[currentIndex].image);
            setImageLoaded(true);
        };

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % blogs.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [blogs, currentIndex]);

    if (!blogs || blogs.length === 0) {
        return null;
    }

    const currentBlog = blogs[currentIndex];
    const displayTitle = getLocalizedContent('title', currentBlog, currentLang);
    const displayContent = getLocalizedContent('content', currentBlog, currentLang);

    const getPlainTextExcerpt = (markdownContent, maxLength = 200) => {
        if (!markdownContent) return '';

        const html = marked.parse(markdownContent);

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        let text = tempDiv.textContent || tempDiv.innerText || '';
        text = text.replace(/\s\s+/g, ' ').trim();

        return text.slice(0, maxLength) + (text.length > maxLength ? '...' : '');
    };

    const excerpt = getPlainTextExcerpt(displayContent, 200);

    return (
        <section className="relative w-full max-w-5xl mx-auto h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden bg-gray-900 text-white rounded-xl">
            <div
                className={`absolute inset-0 w-full h-full`}
                style={{
                    backgroundImage: `url(${currentBlog.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    transition: 'opacity 1s ease-in-out',
                    opacity: imageLoaded ? 1 : 0,
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
            </div>

            <div className="relative z-10 flex items-end h-full p-6 md:p-12 max-w-4xl mx-auto">
                <div className="pb-8 md:pb-12">
                    {currentBlog.tags && currentBlog.tags.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-2 text-sm text-gray-300">
                            {currentBlog.tags.map(tag => (
                                <Link
                                    key={tag}
                                    to={`/tag/${encodeURIComponent(tag.toLowerCase())}`}
                                    className="bg-gray-700 px-2 py-0.5 rounded-full text-xs hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                                >
                                    #{tag}
                                </Link>
                            ))}
                        </div>
                    )}

                    <h3 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4 drop-shadow-lg">
                        {displayTitle}
                    </h3>

                    <p className="text-lg text-gray-200 mb-4 line-clamp-3">
                        {excerpt}
                    </p>

                   <Link
    to={`/blog/${currentBlog.slug || currentBlog._id}`}
    className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg shadow-lg transition-colors duration-200"
>
    {t('blog_card.read_more')}
    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
</Link>
                </div>
            </div>

            <div className="absolute bottom-4 left-0 right-0 flex justify-center z-20">
                {blogs.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-3 h-3 mx-1 rounded-full transition-all duration-300 ${currentIndex === idx ? 'bg-white scale-125' : 'bg-gray-400'}`}
                        aria-label={`Go to slide ${idx + 1}`}
                    ></button>
                ))}
            </div>
        </section>
    );
};

export default FeaturedBlogCarousel;