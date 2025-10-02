// FILE: client/src/Public-App/App.js

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './index.css'; // Assuming this path is correct, relative to this file
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { useTranslation } from 'react-i18next';
import { BlogProvider } from '../context/BlogContext.js';
// --- Core Components ---
import Footer1 from '../components/Public-components/Footer1.jsx';
import TopNavigation from '../components/Public-components/TopNavigation.js';
import ScrollToTop from '../components/Public-components/ScrollToTop.js';
import GtmTracker from '../components/Public-components/GtmTracker.js';
import LanguageNudge from '../components/Public-components/LanguageNudge.jsx';
import SearchResultsPage from "../pages/Public-pages/SearchResultsPage.jsx";
import MinimalFooter from '../components/Public-components/MinimalFooter.js';

// --- Page Components ---
import Home from '../pages/Public-pages/Home.js';
const BlogDetailPage = React.lazy(() => import('../pages/Public-pages/BlogDetailPage.js'));
const CategoryPage = React.lazy(() => import('../pages/Public-pages/CategoryPage.js'));
const TagPage = React.lazy(() => import('../pages/Public-pages/TagPage.js'));
const AboutUsPage = React.lazy(() => import('../pages/Public-pages/AboutUsPage.js'));
const PrivacyPolicyPage = React.lazy(() => import('../pages/Public-pages/PrivacyPolicyPage.js'));
const TermsOfServicePage = React.lazy(() => import('../pages/Public-pages/TermsOfServicePage.js'));
const ContactUsPage = React.lazy(() => import('../pages/Public-pages/ContactUsPage.js'));

axios.interceptors.request.use(
    (config) => {
        const cloudinaryUploadUrl = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`;
        if (config.url && !config.url.startsWith(cloudinaryUploadUrl)) { }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const slugify = (text) => {
    return text
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9\-&]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
};

// NOTE: AdminRedirectComponent has been removed as it is no longer needed.
// The master router in index.js now handles the /cms route.

const AppContent = () => {
    const { t } = useTranslation();
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const standalonePages = ['/about', '/contact', '/privacy', '/terms'];
    const isStandalonePage = standalonePages.includes(location.pathname);

    const fetchCategories = useCallback(async () => {
        try {
            const baseUrl = process.env.REACT_APP_API_BASE_URL || 'https://api.innvibs.com';
            const response = await axios.get(`${baseUrl.replace(/\/$/, '')}/api/blogs/categories`);
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleCategoryChange = (category) => {
        setActiveCategory(category);
        setSearchQuery('');
        if (category.toLowerCase() === 'all') {
            setActiveCategory('all');
            navigate('/');
        } else {
            const categorySlug = slugify(category);
            navigate(`/category/${categorySlug}`);
        }
    };

    const handleLogoClick = () => {
        setActiveCategory('all');
        setSearchQuery('');
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-light-bg-primary dark:bg-dark-bg-primary transition-colors flex flex-col">
            <ScrollToTop />
            <GtmTracker />

            {!isStandalonePage && (
                <TopNavigation
                    activeCategory={activeCategory}
                    onCategoryChange={handleCategoryChange}
                    setSearchQuery={setSearchQuery}
                    onLogoClick={handleLogoClick}
                    categories={categories}
                />
            )}

            <main className="flex-1 overflow-y-auto">
                <Suspense fallback={<div className="text-center py-20 dark:text-gray-200">{t('loading page')}</div>}>
                    <Routes>
                        <Route path="/" element={<Home activeCategory={activeCategory} searchQuery={searchQuery} />} />
                        <Route path="/category/:categoryName" element={<CategoryPage />} />
                        <Route path="/category/:categoryName/:blogSlug" element={<BlogDetailPage />} />
                        <Route path="/tag/:tagName" element={<TagPage />} />
                        <Route path="/about" element={<AboutUsPage />} />
                        <Route path="/privacy" element={<PrivacyPolicyPage />} />
                        <Route path="/terms" element={<TermsOfServicePage />} />
                        <Route path="/contact" element={<ContactUsPage />} />
                        <Route path="/search" element={<SearchResultsPage />} />
                        {/* The /cms route is removed from here. */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>

                {!isStandalonePage && <LanguageNudge />}
            </main>

            {isStandalonePage ? <MinimalFooter /> : <Footer1 />}
        </div>
    );
};

function App() {
    return (
        <BlogProvider>
            <AppContent />
        </BlogProvider>
    );
}

export default App;