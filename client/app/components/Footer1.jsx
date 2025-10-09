'use client'

import React from "react";
import Link from "next/link";
import { useTranslation } from 'react-i18next';
import { useTheme } from './ThemeContext';
import {
  FaLinkedin,
  FaTwitter,
  FaInstagram,
  FaFacebook,
  FaSun,
  FaMoon,
  FaArrowRight,
} from "react-icons/fa";

export default function BalancedMonumentFooter() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme(); // <-- Use shared context

  const blogCategories = [
    { labelKey: "category.technology", value: "Technology" },
    { labelKey: "category.fashion", value: "Fashion" },
    { labelKey: "category.health_wellness", value: "Health & Wellness" },
    { labelKey: "category.travel", value: "Travel" },
    { labelKey: "category.food_cooking", value: "Food & Cooking" },
    { labelKey: "category.sports", value: "Sports" },
    { labelKey: "category.business_finance", value: "Business & Finance" },
    { labelKey: "category.lifestyle", value: "Lifestyle" },
    { labelKey: "category.trends", value: "Trends" },
    { labelKey: "category.relationship", value: "Relationship" },
    { labelKey: "category.astrology", value: "Astrology" },
    { labelKey: "category.vastu_shastra", value: "Vastu Shastra" },
  ];


  const categoryLinks = {
    titleKey: "footer.categories_title",
    links: blogCategories.map(cat => ({
      nameKey: cat.labelKey,
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
      ],
    },
  ];

  const socialLinks = [
  { name: "LinkedIn", icon: <FaLinkedin />, url: "https://linkedin.com", colorClass: "text-[#0077B5]" },
  { name: "Twitter", icon: <FaTwitter />, url: "https://twitter.com", colorClass: "text-[#1DA1F2]" },
  { name: "Instagram", icon: <FaInstagram />, url: "https://instagram.com", colorClass: "text-pink-500" },
  { name: "Facebook", icon: <FaFacebook />, url: "https://www.facebook.com/innvibs", colorClass: "text-[#1877F2]" },
];


  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 pt-8 pb-6 md:px-8 md:pt-10 md:pb-8">

        {/* --- Logo (Light/Dark Mode) --- */}
        <div className="mb-4 md:mb-6">
          <img
            src="/lm..png"
            className="h-20 w-auto max-w-full block dark:hidden"
            alt="innvibs Logo Light"
          />
          <img
            src="logoo1.png"
            className="h-20 w-auto max-w-full hidden dark:block"
            alt="innvibs Logo Dark"
          />
        </div>

       {/* --- Tagline --- */}
<div className="mb-6 md:mb-8">
  <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
    <span className="block">
      {t('footer.tagline_line1', 'Inner Vibes — Explore Inside, Express Outside')}
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
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-wider uppercase mb-3">
                {t(section.titleKey)}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.nameKey || link.name}>
                    <Link
                      href={link.path}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                      {t(link.nameKey || link.name)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-1 text-center md:text-left">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-wider uppercase mb-3">
              {t('footer.newsletter_title')}
            </h3>
            <form className="flex items-center max-w-xs mx-auto md:mx-0">
              <input
                type="email"
                placeholder={t('footer.email_placeholder')}
                className="w-full bg-white dark:bg-gray-900 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-l-md focus:ring-2 focus:ring-violet-500 focus:outline-none transition-colors"
                aria-label={t('footer.email_aria_label')}
              />
              <button
                type="submit"
                className="bg-violet-600 text-white p-2.5 rounded-r-md hover:bg-violet-700 transition-colors"
                aria-label={t('footer.subscribe_aria_label')}
                title={t('footer.subscribe_title')}>
                <FaArrowRight />
              </button>
            </form>
          </div>
        </div>

       {/* --- Bottom Bar --- */}
<div className="mt-6 pt-4 md:mt-8 md:pt-5 border-t border-gray-200 dark:border-gray-800 
                flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-3">
  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-0">
    © {new Date().getFullYear()} <span className="font-semibold text-gray-700 dark:text-gray-200">Inner Vibes</span><br />
    Powered by <span className="font-medium text-emerald-600 dark:text-emerald-400">Astrox Softech Pvt. Ltd.</span> — All Rights Reserved.
  </p>
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                title={social.name}
                className={`${social.colorClass} hover:opacity-80 transition-colors text-lg`}>
                {social.icon}
              </a>
            ))}
            <div className="border-l border-gray-300 dark:border-gray-700 h-4 sm:h-5"></div>
            <button
              onClick={toggleTheme}
              title={t('theme_toggle.toggle_theme_title')}
              className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2 text-sm">
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