// FILE: client/app/components/MinimalFooter.js

import React from 'react';
import Link from 'next/link';

const MinimalFooter = () => {
  const linkCls =
    "text-sm text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-200";

  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-0">
            © {new Date().getFullYear()} Sexorism Blogs. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 md:space-x-6">
            <Link href="/about" className={linkCls}>About Us</Link>
            <Link href="/contact" className={linkCls}>Contact</Link>
            <Link href="/terms" className={linkCls}>Terms</Link>
            <Link href="/privacy" className={linkCls}>Privacy</Link>

            {/* --- NEW (compliance): external links, same visual weight */}
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className={linkCls}
              aria-label="Ad choices (Google Ads Settings)"
            >
              Ad choices
            </a>
            <a
              href="https://optout.aboutads.info"
              target="_blank"
              rel="noopener noreferrer"
              className={linkCls}
              aria-label="About Ads (US DAA)"
            >
              About Ads
            </a>
            <a
              href="https://optout.networkadvertising.org"
              target="_blank"
              rel="noopener noreferrer"
              className={linkCls}
              aria-label="NAI Opt-Out"
            >
              NAI Opt-Out
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default MinimalFooter;
