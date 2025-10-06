'use client'

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useShare } from "../../context/ShareContext";
import { Copy } from "lucide-react";
import {
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  LinkedInIcon,
  MailIcon,
  WhatsAppIcon,
  TelegramIcon,
} from "./SocialIcons";

const isMobile = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 767px)").matches;
};

const Tooltip = ({ text }) => (
  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max whitespace-nowrap bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-200 delay-100 pointer-events-none z-10">
    {text}
  </span>
);

const ShareButton = ({
  title = "Check this out!",
  url,
  blogId,
  blogSlug,
  variant = "pill",
  primary = true,
  showCountOnIcon = false,
}) => {
  const shareUrl =
    url || (typeof window !== "undefined" ? window.location.href : "");
  const { getShareCount, incrementShareCount } = useShare();

  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrapperRef = useRef(null);

  const shareCount = getShareCount(blogId) || 0;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const trackShareEvent = (platform) => {
    if (window.dataLayer) {
      window.dataLayer.push({
        event: "share_blog",
        share_platform: platform.toLowerCase(),
        blog_id: blogId,
        blog_slug: blogSlug,
        blog_title: title,
      });
    }
  };

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(title);
  
  const links = useMemo(
    () => [
      { name: "WhatsApp", href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`, Icon: WhatsAppIcon },
      { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, Icon: FacebookIcon },
      { name: "Twitter", href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`, Icon: TwitterIcon },
      { name: "Telegram", href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`, Icon: TelegramIcon },
      { name: "Instagram", href: '[https://www.instagram.com](https://www.instagram.com)', Icon: InstagramIcon },
      { name: "LinkedIn", href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedText}`, Icon: LinkedInIcon },
      { name: "Email", href: `mailto:?subject=${encodedText}&body=${encodedUrl}`, Icon: MailIcon },
    ],
    [encodedUrl, encodedText]
  );

  const quickShareLinks = useMemo(
    () =>
      links.filter((link) =>
        ["WhatsApp", "Facebook", "Twitter", "Telegram"].includes(link.name)
      ),
    [links]
  );

  const handleShareClick = async () => {
    if (isMobile() && navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
        await incrementShareCount(blogId);
        trackShareEvent("native_share");
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
      await incrementShareCount(blogId);
      trackShareEvent("copy_link");
    } catch (_) {}
  };

  return (
    <div className="flex items-center gap-2" ref={wrapperRef}>
      <div className="relative inline-block group">
        <button
          type="button"
          onClick={handleShareClick}
          className={
            variant === "icon"
              ? "flex items-center justify-center w-auto h-8 px-1 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              : primary
              ? "flex items-center gap-2 rounded-full px-3 py-1.5 bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
              : "flex items-center gap-2 rounded-full px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 shadow-sm hover:shadow-md active:scale-95 transition-all"
          }
          aria-label="More share options"
        >
          {variant === "icon" ? (
            <>
              <div className="flex items-center justify-center w-6 h-6">
                <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7a3.3 3.3 0 0 0 0-1.39l7.05-4.11A2.99 2.99 0 1 0 14 5a2.99 2.99 0 0 0 .05.55l-7.05 4.12a2.99 2.99 0 1 0 0 4.66l7.05 4.11A2.99 2.99 0 1 0 18 16.08z" />
                </svg>
              </div>
              {showCountOnIcon && (
                <span className="text-xs font-semibold pr-1">
                  {shareCount}
                </span>
              )}
            </>
          ) : (
            <>
              <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 opacity-90">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7a3.3 3.3 0 0 0 0-1.39l7.05-4.11A2.99 2.99 0 1 0 14 5a2.99 2.99 0 0 0 .05.55l-7.05 4.12a2.99 2.99 0 1 0 0 4.66l7.05 4.11A2.99 2.99 0 1 0 18 16.08z" />
              </svg>
              <span className="hidden sm:inline text-sm font-medium">Share</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/20 text-white">
                {shareCount}
              </span>
            </>
          )}
        </button>
        <Tooltip text="More share options" />
        
        {!isMobile() && open && (
          <div className="absolute right-0 mt-3 w-64 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl p-2 z-30">
            <ul className="max-h-80 overflow-auto py-1">
              {links.map(({ name, href, Icon }) => (
                <li key={name}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={async () => {
                      setOpen(false);
                      await incrementShareCount(blogId);
                      trackShareEvent(name);
                    }}>
                    <Icon size={18} />
                    <span>{name}</span>
                  </a>
                </li>
              ))}
              <li>
                <button type="button" onClick={handleCopy} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Copy size={18} />
                  <span>Copy Link</span>
                </button>
              </li>
            </ul>
            {copied && <div className="absolute -bottom-8 right-0 text-sm bg-black text-white px-3 py-1 rounded-md shadow-md">Link copied!</div>}
          </div>
        )}
      </div>

      {quickShareLinks.map(({ name, href, Icon }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${name}`}
          className="relative group flex items-center justify-center w-8 h-8 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          onClick={async () => {
            await incrementShareCount(blogId);
            trackShareEvent(name);
          }}
        >
          <Icon size={18} />
          <Tooltip text={name} />
        </a>
      ))}
    </div>
  );
};

export default ShareButton;