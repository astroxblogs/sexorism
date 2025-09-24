import React from 'react';
import { Outlet, Link } from 'react-router-dom';

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
                        <Link to="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                           Home
                        </Link>
                         <Link to="/contact" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                           Contact
                        </Link>
                         <Link to="/privacy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                           Privacy Policy
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};


// This layout component is for the standalone pages (About, Contact, etc.).
// It does NOT include the main site header.
// It includes the new, simpler footer.
const LegalLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-light-bg-primary dark:bg-dark-bg-primary">
            {/* The Outlet component will render the specific page (e.g., AboutUsPage) */}
            <main className="flex-grow">
                <Outlet />
            </main>
            <MinimalFooter />
        </div>
    );
};

export default LegalLayout;

