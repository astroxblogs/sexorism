import React from 'react';
import Link from 'next/link';

// --- Placeholder Component to resolve bundling errors ---
// In your actual project, you would import MinimalFooter from its own file.
// This is combined here to fix the preview environment error.
const MinimalFooter = () => {
    // A simplified footer without translation for the preview
    return (
        <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
            <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-center text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-0">
                        © {new Date().getFullYear()} Innvibs Blogs. All rights reserved.
                    </p>
                    <div className="flex items-center space-x-4">
                         <Link href="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                            Home
                         </Link>
                          <Link href="/contact" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                            Contact
                         </Link>
                          <Link href="/privacy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                            Privacy Policy
                         </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};


const LegalLayout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-light-bg-primary dark:bg-dark-bg-primary">
            {/* The children will render the specific page (e.g., AboutUsPage) */}
            <main className="flex-grow">
                {children}
            </main>
            <MinimalFooter />
        </div>
    );
};

export default LegalLayout;
