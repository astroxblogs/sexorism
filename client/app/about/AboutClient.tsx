import React from 'react';

export default function AboutClient() {
    const categories = [
        { name: 'Lifestyle', desc: 'Tips and advice to enhance your daily life and well-being', icon: '✨' },
        { name: 'Fashion', desc: 'Stay updated with the latest trends and style guides', icon: '👗' },
        { name: 'Technology', desc: 'Insights into the ever-evolving tech world', icon: '💻' },
        { name: 'Travel', desc: 'Explore new destinations and travel experiences', icon: '✈️' },
        { name: 'Sports', desc: 'Coverage of your favorite sports and athletes', icon: '⚽' },
        { name: 'Astrology', desc: 'Discover how the stars influence your life', icon: '⭐' },
        { name: 'Vastu Shastra', desc: 'Learn about the ancient science of architecture and design', icon: '🏛️' }
    ];

    const values = [
        { title: 'Integrity', desc: 'We uphold the highest standards of honesty and transparency in our content', icon: '🛡️' },
        { title: 'Creativity', desc: 'We embrace innovative ideas and diverse perspectives', icon: '🎨' },
        { title: 'Community', desc: 'We foster a sense of belonging and connection among our readers', icon: '🤝' },
        { title: 'Excellence', desc: 'We are committed to delivering top-notch content that adds value to our readers\' lives', icon: '🏆' }
    ];

    return (
        <div className="bg-gradient-to-b from-light-bg-primary to-gray-50 dark:from-dark-bg-primary dark:to-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 dark:from-purple-500/5 dark:via-pink-500/5 dark:to-blue-500/5"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative">
                    <div className="text-center space-y-6">
                        <div className="inline-block">
                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent">
                                Sexorism
                            </h1>
                            <div className="h-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-full mt-2"></div>
                        </div>
                        <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 font-light italic">
                            Inner Vibes — Explore Inside, Express Outside
                        </p>
                        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">
                            Your daily source for insightful articles and trending stories
                        </p>
                    </div>
                </div>
            </div>

            {/* Who We Are Section */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 sm:p-12 border border-gray-100 dark:border-gray-700">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-center">
                        <span className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                            Who We Are
                        </span>
                    </h2>
                    <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed text-center max-w-4xl mx-auto">
                        Sexorism is more than just a blog; it's a vibrant community of passionate writers, thinkers, and creators dedicated to bringing you insightful content that enriches your life. Whether you're seeking the latest fashion trends, tech innovations, travel guides, or spiritual wisdom, we've got you covered.
                    </p>
                </div>
            </div>

            {/* Mission Section */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-3xl p-8 sm:p-12 border border-purple-100 dark:border-purple-800">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-center">
                        <span className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                            Our Mission
                        </span>
                    </h2>
                    <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed text-center max-w-4xl mx-auto">
                        Our mission is to provide our readers with high-quality, engaging, and informative content that inspires and empowers. We aim to be a trusted source of knowledge, offering diverse perspectives and expert insights across various domains.
                    </p>
                </div>
            </div>

            {/* What We Offer Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center">
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                        What We Offer
                    </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categories.map((category, index) => (
                        <div 
                            key={index}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:scale-105 hover:border-purple-300 dark:hover:border-purple-600 group"
                        >
                            <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                                {category.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                {category.name}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                {category.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Our Values Section */}
            <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center">
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                            Our Values
                        </span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {values.map((value, index) => (
                            <div 
                                key={index}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border-l-4 border-purple-500 dark:border-purple-400 hover:shadow-2xl transition-all duration-300"
                            >
                                <div className="flex items-start space-x-4">
                                    <div className="text-4xl flex-shrink-0">{value.icon}</div>
                                    <div>
                                        <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">
                                            {value.title}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                            {value.desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Join Us Section */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-700 dark:to-blue-700 rounded-3xl p-8 sm:p-12 text-center shadow-2xl">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-white">
                        Join Us on Our Journey
                    </h2>
                    <p className="text-lg text-white/90 leading-relaxed max-w-4xl mx-auto mb-8">
                        At Sexorism, we continually evolve and expand our horizons. We invite you to join us on this exciting journey of discovery and growth. Stay connected, stay inspired, and let Sexorism be your trusted companion in navigating the world of lifestyle, fashion, technology, travel, sports, astrology, and vastu shastra.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button className="bg-white text-purple-600 font-semibold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl">
                            Explore Articles
                        </button>
                        <button className="bg-transparent border-2 border-white text-white font-semibold px-8 py-3 rounded-full hover:bg-white/10 transition-colors">
                            Subscribe Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

