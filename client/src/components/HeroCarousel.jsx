import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { marked } from 'marked';
import { useTranslation } from 'react-i18next';

const HeroCarousel = ({ blogs }) => {
    const { i18n, t } = useTranslation();
    const currentLang = i18n.language;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [imageLoaded, setImageLoaded] = useState(false);

    const getLocalizedContent = (field, blogData, lang) => {
        const localizedField = blogData?.[`${field}_${lang}`];
        if (localizedField) return localizedField;
        if (blogData?.[`${field}_en`]) return blogData?.[`${field}_en`];
        return blogData?.[field] || '';
    };

    useEffect(() => {
        if (!Array.isArray(blogs) || blogs.length === 0) return;

        setImageLoaded(false);
        const img = new Image();
        img.src = blogs[currentIndex]?.image;
        img.onload = () => setImageLoaded(true);
        img.onerror = () => setImageLoaded(true);

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % blogs.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [blogs, currentIndex]);

    if (!Array.isArray(blogs) || blogs.length === 0) return null;

    const currentBlog = blogs[currentIndex];
    const title = getLocalizedContent('title', currentBlog, currentLang);
    const content = getLocalizedContent('content', currentBlog, currentLang);

    const getPlainTextExcerpt = (markdownContent, maxLength = 180) => {
        if (!markdownContent) return '';
        const html = marked.parse(markdownContent);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const text = (tempDiv.textContent || tempDiv.innerText || '').replace(/\s\s+/g, ' ').trim();
        return text.slice(0, maxLength) + (text.length > maxLength ? '...' : '');
    };

    const excerpt = getPlainTextExcerpt(content);

    const goPrev = () => setCurrentIndex((idx) => (idx - 1 + blogs.length) % blogs.length);
    const goNext = () => setCurrentIndex((idx) => (idx + 1) % blogs.length);

    return (
        <section className="relative w-full">
            <div className="relative h-[320px] sm:h-[380px] md:h-[420px] overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-800">
                <div
                    className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'} pointer-events-none`}
                    style={{ backgroundImage: `url(${currentBlog?.image})` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
                </div>

                <div className="relative z-10 h-full flex items-end pointer-events-none">
                    <div className="p-4 sm:p-6 md:p-8 w-full max-w-[720px] pointer-events-auto">
                       
                        <Link to={`/category/${currentBlog?.category?.toLowerCase().replace(/\s+/g, '-')}/${currentBlog?.slug || currentBlog?._id}`} className="block">
    <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight drop-shadow">
        {title}
    </h2>
</Link>
                        <p className="mt-3 text-gray-200 text-sm sm:text-base line-clamp-3">
                            {excerpt}
                        </p>
                        <Link
    to={`/category/${currentBlog?.category?.toLowerCase().replace(/\s+/g, '-')}/${currentBlog?.slug || currentBlog?._id}`}
    className="inline-block mt-4 px-4 py-2 rounded-md bg-white/90 text-gray-900 text-sm font-semibold hover:bg-white"
>
    {t('blog_card.read_more')}
</Link>
                    </div>
                </div>

                <button onClick={goPrev} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 z-30">
                    ‹
                </button>
                <button onClick={goNext} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 z-30">
                    ›
                </button>

                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-20">
                    {Array.isArray(blogs) && blogs.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`w-2.5 h-2.5 rounded-full ${idx === currentIndex ? 'bg-white' : 'bg-white/60'}`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};
 
export default HeroCarousel;




