'use client'

import React from "react";
import Link from "next/link";
import { useTranslation } from 'react-i18next';
import { useTheme } from './ThemeContext';
import { usePathname } from 'next/navigation';
import {
  // FaLinkedin,
  // FaTwitter,
  FaInstagram,
  FaFacebook,
  FaSun,
  FaMoon,
  FaArrowRight,
} from "react-icons/fa";

export default function BalancedMonumentFooter({ categories = [] }) {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  // Get current language from i18n (reactive to language changes)
  const currentLang = i18n?.resolvedLanguage || i18n?.language || 'en';
  const isHindi = currentLang.startsWith('hi');

  // Locale-aware prefix: '/hi' when browsing Hindi, '' for English
  const localePrefix = React.useMemo(() => {
    if (pathname && pathname.startsWith('/hi')) return '/hi';
    if (typeof document !== 'undefined') {
      const m = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/);
      if (m && String(m[1]).startsWith('hi')) return '/hi';
    }
    return '';
  }, [pathname]);

  // Get localized category name (same logic as navbar)
  const getCategoryName = (category) => {
    return isHindi ? category.name_hi || category.name_en : category.name_en || category.name_hi;
  };

  // Use dynamic categories from props, fallback to hardcoded if empty
  const blogCategories = React.useMemo(() => {
    if (categories.length > 0) {
      return categories.map(cat => {
        const displayName = getCategoryName(cat);

        return {
          value: cat.name_en,
          displayName: displayName
        };
      });
    } else {
      // Fallback hardcoded categories with proper localization
      return [
        { value: "Technology", displayName: t("category.technology") },
        { value: "Fashion", displayName: t("category.fashion") },
        { value: "Health & Wellness", displayName: t("category.health_wellness") },
        { value: "Travel", displayName: t("category.travel") },
        { value: "Food & Cooking", displayName: t("category.food_cooking") },
        { value: "Sports", displayName: t("category.sports") },
        { value: "Business & Finance", displayName: t("category.business_finance") },
        { value: "Lifestyle", displayName: t("category.lifestyle") },
        { value: "Trends", displayName: t("category.trends") },
        { value: "Relationship", displayName: t("category.relationship") },
        { value: "Astrology", displayName: t("category.astrology") },
        { value: "Vastu Shastra", displayName: t("category.vastu_shastra") },
      ];
    }
  }, [categories, isHindi, t]);

  const categoryLinks = {
    titleKey: "footer.categories_title",
    links: blogCategories.map(cat => ({
      name: cat.displayName, // Always use displayName (localized name)
      path: `/category/${cat.value.toLowerCase().replace(/ & /g, '-&-').replace(/ /g, '-')}`
    }))
  };

  const footerSections = [
    {
      titleKey: "footer.company_title",
      links: [
        { nameKey: "footer.about_us", path: "/about" },
        { nameKey: "footer.contact", path: "/contact" },
      ],
    },
    categoryLinks,
    {
      titleKey: "footer.legal_title",
      links: [
        { nameKey: "footer.privacy_policy", path: "/privacy" },
        { nameKey: "footer.terms_of_service", path: "/terms" },
        { nameKey: "footer.sitemap", path: "/sitemap" },
        { name: "Ad choices", external: true, href: "https://adssettings.google.com" },
        { name: "About Ads (US DAA)", external: true, href: "https://optout.aboutads.info" },
        { name: "NAI Opt-Out", external: true, href: "https://optout.networkadvertising.org" },
      ],
    },
  ];

  const socialLinks = [
    // { name: "LinkedIn", icon: <FaLinkedin />, url: "https://linkedin.com", colorClass: "text-[#0077B5]" },
    // { name: "Twitter", icon: <FaTwitter />, url: "https://twitter.com", colorClass: "text-[#1DA1F2]" },
    { name: "Instagram", icon: <FaInstagram />, url: "https://instagram.com", colorClass: "text-pink-500" },
    { name: "Facebook", icon: <FaFacebook />, url: "https://www.facebook.com/Sexorism", colorClass: "text-[#1877F2]" },
  ];

  return (
    <footer className="bg-[var(--color-bg-secondary)] border-t border-light-border">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 pt-8 pb-6 md:px-8 md:pt-10 md:pb-8">

        {/* --- Logo (Light/Dark Mode) --- */}
        <div className="mb-4 md:mb-6">
          <img
            src="/light.png"
            className="h-20 w-auto max-w-full block dark:hidden"
            alt="Sexorism Logo Light"
          />
          <img
            src="light.png"
            className="h-20 w-auto max-w-full hidden dark:block"
            alt="Sexorism Logo Dark"
          />
        </div>

        {/* --- Tagline --- */}
        <div className="mb-6 md:mb-8">
          <p className="text-sm md:text-base text-[var(--color-text-secondary)] max-w-2xl leading-relaxed">
            <span className="block">
              {t('footer.tagline_line1', 'Sexorism — Explore Inside, Express Outside')}
            </span>
            <span className="block">
              {t('footer.tagline_line2', 'A curated space for insights, stories, and ideas that matter.')}
            </span>
          </p>
        </div>

        {/* --- Sections Grid --- */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-y-5 gap-x-6">
          {footerSections.map((section) => (
            <div key={section.titleKey} className="text-center md:text-left">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)] tracking-wider uppercase mb-3">
                {t(section.titleKey)}
              </h3>
              <ul className="space-y-2">
                {section.links
                  .filter(Boolean)
                  .map((link) => {
                    const isExternal =
                      !!link?.external && typeof link?.href === 'string' && link.href.length > 0;
                    const hasInternal =
                      !isExternal && typeof link?.path === 'string' && link.path.length > 0;

                    if (!isExternal && !hasInternal) {
                      if (typeof window !== 'undefined') {
                        // eslint-disable-next-line no-console
                        console.warn('[Footer] Skipping invalid link item:', link);
                      }
                      return null;
                    }

                    const hrefStr = hasInternal ? (() => {
                      let h = link.path;

                      if (h.startsWith('/category/')) {
                        const slug = h.slice('/category/'.length);
                        h = (localePrefix === '/hi') ? `/hi/${slug}` : `/${slug}`;
                      }

                      if (h.slice(0, 7) === '/hi/en/') h = '/hi/' + h.slice(7);
                      else if (h.slice(0, 4) === '/en/') h = '/' + h.slice(4);

                      return h;
                    })() : undefined;

                    return (
                      <li key={link?.nameKey || link?.name}>
                        {isExternal ? (
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors duration-200"
                            aria-label={link.name}
                          >
                            {link.name}
                          </a>
                        ) : (
                          <Link
                            href={hrefStr || '/'}
                            className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors duration-200"
                          >
                            {link?.name}
                          </Link>
                        )}
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-1 text-center md:text-left">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] tracking-wider uppercase mb-3">
              {t('footer.newsletter_title')}
            </h3>
            <form className="flex items-center max-w-xs mx-auto md:mx-0">
              <input
                type="email"
                placeholder={t('footer.email_placeholder')}
                className="
                  w-full px-3 py-2 text-sm
                  bg-[var(--color-bg-primary)]
                  border border-light-border
                  rounded-l-md
                  text-[var(--color-text-primary)]
                  placeholder-[var(--color-text-secondary)]
                  focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-none
                  transition-colors
                "
                aria-label={t('footer.email_aria_label')}
              />
              <button
                type="submit"
                className="
                  bg-[var(--color-accent)]
                  text-[var(--color-bg-primary)]
                  p-2.5 rounded-r-md
                  hover:opacity-90 transition-colors
                "
                aria-label={t('footer.subscribe_aria_label')}
                title={t('footer.subscribe_title')}
              >
                <FaArrowRight />
              </button>
            </form>
          </div>
        </div>

        {/* --- Bottom Bar --- */}
        <div
          className="
            mt-6 pt-4 md:mt-8 md:pt-5
            border-t border-light-border
            flex flex-col sm:flex-row justify-between items-center
            text-center sm:text-left gap-3
          "
        >
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mb-0">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-[var(--color-text-primary)]">Sexorism</span>
            <br />
            Powered by{" "}
            <span className="font-medium text-[var(--color-accent)]">
              Sexorism Pvt. Ltd.
            </span>{" "}
            — All Rights Reserved.
          </p>
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                title={social.name}
                className={`${social.colorClass} hover:opacity-80 transition-colors text-lg`}
              >
                {social.icon}
              </a>
            ))}
            <div className="border-l border-light-border h-4 sm:h-5"></div>
            <button
              onClick={toggleTheme}
              title={t('theme_toggle.toggle_theme_title')}
              className="
                text-[var(--color-text-secondary)]
                hover:text-[var(--color-text-primary)]
                transition-colors flex items-center gap-2 text-sm
              "
            >
              {theme === "light" ? <FaMoon /> : <FaSun />}
              <span className="hidden sm:inline">
                {theme === "light" ? t('theme_toggle.dark') : t('theme_toggle.light')} {t('theme_toggle.mode')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
