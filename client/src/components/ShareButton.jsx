import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { Share } from 'lucide-react';

const isMobile = () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 767px)').matches;
};

// Inline SVG icons for all social platforms
const WhatsAppIcon = ({ size = 18, className = '' }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        width={size}
        height={size}
        className={className}
        aria-hidden="true"
    >
        <path fill="#25D366" d="M19.11 17.67c-.27-.14-1.57-.78-1.81-.87-.24-.09-.41-.14-.59.14-.17.27-.68.87-.83 1.04-.15.18-.31.2-.58.07-.27-.14-1.13-.42-2.16-1.34-.8-.71-1.34-1.58-1.49-1.85-.15-.27-.02-.42.11-.55.12-.12.27-.31.41-.47.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.59-1.42-.82-1.94-.22-.53-.44-.45-.59-.45h-.5c-.17 0-.45.07-.69.34-.24.27-.9.88-.9 2.13s.92 2.47 1.05 2.64c.13.18 1.81 2.76 4.38 3.86.61.26 1.09.41 1.46.53.61.19 1.17.16 1.61.1.49-.07 1.57-.64 1.79-1.26.22-.62.22-1.15.15-1.26-.07-.11-.24-.18-.51-.31z"/>
        <path fill="#25D366" d="M16 3C9.373 3 4 8.373 4 15c0 2.647.855 5.095 2.309 7.083L5 29l7.114-1.86C13.99 27.695 14.98 28 16 28c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22.917c-.93 0-1.83-.145-2.676-.414l-.19-.062-4.235 1.108 1.13-4.123-.124-.193A9.049 9.049 0 0 1 6.083 15C6.083 9.78 10.78 5.083 16 5.083S25.917 9.78 25.917 15 21.22 25.917 16 25.917z"/>
    </svg>
);

const FacebookIcon = ({ size = 18, className = '' }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className={className}
        aria-hidden="true"
    >
        <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
);

const TwitterIcon = ({ size = 18, className = '' }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className={className}
        aria-hidden="true"
    >
        <path fill="#1DA1F2" d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
    </svg>
);

const InstagramIcon = ({ size = 18, className = '' }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className={className}
        aria-hidden="true"
    >
        <path fill="#E4405F" d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z"/>
    </svg>
);

const LinkedInIcon = ({ size = 18, className = '' }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className={className}
        aria-hidden="true"
    >
        <path fill="#0A66C2" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
);

const MailIcon = ({ size = 18, className = '' }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className={className}
        aria-hidden="true"
    >
        <path fill="#EA4335" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h.819L12 13.09l9.545-9.269h.819A1.636 1.636 0 0 1 24 5.457z"/>
    </svg>
);

const CopyIcon = ({ size = 18, className = '' }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className={className}
        aria-hidden="true"
    >
        <path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
    </svg>
);

// UPDATE: Added blogSlug to props for GTM
const ShareButton = ({ title = 'Check this out!', url, blogId, blogSlug, initialShareCount = 0 }) => {
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [shareCount, setShareCount] = useState(initialShareCount || 0);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // --- GTM UPDATE: Centralized tracking function ---
    const trackShareEvent = (platform) => {
        if (window.dataLayer) {
            window.dataLayer.push({
                event: 'share_blog',
                share_platform: platform.toLowerCase(), // Standardize platform name
                blog_id: blogId,
                blog_slug: blogSlug,
                blog_title: title,
            });
        }
    };

    const incrementShareCount = async () => {
        if (!blogId) return;
        try {
            const res = await axios.post(`/api/blogs/${blogId}/share`);
            if (res?.data?.shareCount !== undefined) {
                setShareCount(res.data.shareCount);
            } else {
                setShareCount((c) => c + 1);
            }
        } catch (_) {
            setShareCount((c) => c + 1);
        }
    };

    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(title);

    const links = useMemo(() => ([
        {
            name: 'WhatsApp',
            href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
            Icon: WhatsAppIcon,
            color: 'hover:bg-green-50 dark:hover:bg-green-900/30'
        },
        {
            name: 'Facebook',
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            Icon: FacebookIcon,
            color: 'hover:bg-blue-50 dark:hover:bg-blue-900/30'
        },
        {
            name: 'Twitter',
            href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
            Icon: TwitterIcon,
            color: 'hover:bg-sky-50 dark:hover:bg-sky-900/30'
        },
        {
            name: 'Instagram',
            href: `https://www.instagram.com/?url=${encodedUrl}`,
            Icon: InstagramIcon,
            color: 'hover:bg-pink-50 dark:hover:bg-pink-900/30'
        },
        {
            name: 'LinkedIn',
            href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedText}`,
            Icon: LinkedInIcon,
            color: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
        },
        {
            name: 'Email',
            href: `mailto:?subject=${encodedText}&body=${encodedUrl}`,
            Icon: MailIcon,
            color: 'hover:bg-amber-50 dark:hover:bg-amber-900/30'
        }
    ]), [encodedUrl, encodedText]);

    const handleShareClick = async () => {
        if (isMobile() && navigator.share) {
            try {
                await navigator.share({ title, url: shareUrl });
                await incrementShareCount();
                trackShareEvent('native_share'); // --- GTM UPDATE ---
            } catch (_) {}
            return;
        }
        setOpen((v) => !v);
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
            await incrementShareCount();
            trackShareEvent('copy_link'); // --- GTM UPDATE ---
        } catch (_) {}
    };

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            <button
                type="button"
                onClick={handleShareClick}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 shadow-sm hover:shadow-md active:scale-95 transition-all"
                aria-label="Share this page"
            >
                <Share size={16} />
                <span className="hidden sm:inline text-sm"></span>
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 font-medium">{shareCount}</span>
            </button>

            {!isMobile() && open && (
                <div className="absolute right-0 mt-3 w-64 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl p-2 z-30">
                    <div className="px-2 py-1 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400"></div>
                    <ul className="max-h-80 overflow-auto py-1">
                        {links.map(({ name, href, Icon, color }) => (
                            <li key={name}>
                                <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white ${color}`}
                                    onClick={async () => {
                                        setOpen(false);
                                        await incrementShareCount();
                                        trackShareEvent(name); // --- GTM UPDATE ---
                                    }}
                                >
                                    <Icon size={18} />
                                    <span>{name}</span>
                                </a>
                            </li>
                        ))}
                        <li>
                            <button
                                type="button"
                                onClick={handleCopy}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                <CopyIcon size={18} />
                                <span>Copy Link</span>
                            </button>
                        </li>
                    </ul>
                    {copied && (
                        <div className="absolute -bottom-8 right-0 text-sm bg-black text-white px-3 py-1 rounded-md shadow-md">
                            Link copied!
                        </div>
                    )}
                </div>
            )}

            {isMobile() && copied && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-sm bg-black text-white px-3 py-1 rounded-md shadow-md z-40">
                    Link copied!
                </div>
            )}
        </div>
    );
};

export default ShareButton;
