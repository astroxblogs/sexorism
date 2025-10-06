// FILE: client/src/components/MinimalFooter.js

import React from 'react';
import Link from 'next/link';

const MinimalFooter = () => {
    return (
        <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
            <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-center text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-0">
                        © {new Date().getFullYear()} Innvibs Blogs. All rights reserved.
                    </p>
                    <div className="flex items-center space-x-4 md:space-x-6">
                        {/* --- UPDATED LINK STYLES --- */}
                        <Link 
                            href="/about" 
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-200"
                        >
                           About Us
                        </Link>
                         <Link 
                            href="/contact" 
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-200"
                        >
                           Contact
                        </Link>
                         <Link 
                            href="/terms" 
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-200"
                        >
                           Terms
                        </Link>
                         <Link 
                            href="/privacy" 
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-200"
                        >
                           Privacy
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default MinimalFooter;