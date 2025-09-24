// FILE: client/src/pages/AboutUsPage.js

import React from 'react';

const AboutUsPage = () => {
    return (
        <div className="bg-light-bg-primary dark:bg-dark-bg-primary text-gray-900 dark:text-gray-100">
            <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold">
                        About Innvibs
                    </h1>
                    <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
                        Your daily source for insightful articles and trending stories.
                    </p>
                </div>
                <div className="prose prose-lg dark:prose-invert mx-auto text-gray-700 dark:text-gray-300">
                    <p>
                        Welcome to Innvibs, your number one source for all things related to technology, lifestyle, fashion, and more. We're dedicated to giving you the very best of content, with a focus on reliability, uniqueness, and insightful analysis.
                    </p>
                    <h2>Our Mission</h2>
                    <p>
                        Our mission is to empower our readers with knowledge and inspiration. We believe that great content can spark curiosity, encourage learning, and foster a sense of community. We strive to create articles that are not only informative but also enjoyable to read.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AboutUsPage;