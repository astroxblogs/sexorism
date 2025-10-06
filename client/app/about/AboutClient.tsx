'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

const AboutClient = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6">
          <div className="relative">
            <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight">
              About Innvibs
            </h1>
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-blue-600/20 blur-3xl -z-10 animate-pulse"></div>
          </div>

          <div className="relative inline-block">
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-medium">
              Your trusted source for insightful articles and stories
            </p>
          </div>

          <div className="flex justify-center">
            <div className="h-1 w-24 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"></div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-16">
          {/* Mission Section */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              At Innvibs, we believe in the power of knowledge and storytelling. Our mission is to create a platform where
              curious minds can discover insightful articles, thought-provoking stories, and innovative ideas that shape our world.
              We cover diverse topics ranging from technology and lifestyle to astrology and wellness, ensuring there's something
              valuable for every reader.
            </p>
          </div>

          {/* Vision Section */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">Our Vision</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              We envision Innvibs as a vibrant community where knowledge flows freely, ideas are exchanged, and perspectives are broadened.
              Our goal is to foster curiosity, encourage learning, and provide a space where readers can explore new concepts,
              challenge their understanding, and discover fresh insights that enrich their lives.
            </p>
          </div>

          {/* Values Section */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">Our Values</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-violet-600 dark:text-violet-400 mb-3">Quality Content</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We are committed to delivering well-researched, accurate, and engaging content that adds real value to our readers' lives.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-violet-600 dark:text-violet-400 mb-3">Diversity & Inclusion</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We celebrate diverse perspectives and ensure our content reflects the rich tapestry of human experiences and cultures.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-violet-600 dark:text-violet-400 mb-3">Innovation</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We embrace new technologies and creative approaches to deliver content in ways that engage and inspire our audience.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-violet-600 dark:text-violet-400 mb-3">Community</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We foster a welcoming community where readers and writers can connect, share ideas, and grow together.
                </p>
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">Our Team</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              Innvibs is powered by a passionate team of writers, editors, and technologists who share a common love for
              knowledge and storytelling. Our diverse team brings together expertise from various fields to create content
              that is both informative and engaging.
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              We work collaboratively to ensure that every article published on Innvibs meets our high standards of quality,
              accuracy, and relevance to our readers' interests.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutClient;