// FILE: client/src/App.js

import React, { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './index.css';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { useTranslation } from 'react-i18next';
import { BlogProvider } from './context/BlogContext';
// --- Core Components ---
import Footer1 from './components/Footer1';
import TopNavigation from './components/TopNavigation';
import ScrollToTop from './components/ScrollToTop';
import GtmTracker from './components/GtmTracker';
import LanguageNudge from './components/LanguageNudge.jsx';
import SearchResultsPage from "./pages/SearchResultsPage";
import MinimalFooter from './components/MinimalFooter'; // <-- Import the new footer

// --- Page Components ---
import Home from './pages/Home';
const BlogDetailPage = React.lazy(() => import('./pages/BlogDetailPage'));
const CategoryPage = React.lazy(() => import('./pages/CategoryPage'));
const TagPage = React.lazy(() => import('./pages/TagPage'));
const AboutUsPage = React.lazy(() => import('./pages/AboutUsPage'));
const PrivacyPolicyPage = React.lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsOfServicePage = React.lazy(() => import('./pages/TermsOfServicePage'));
const ContactUsPage = React.lazy(() => import('./pages/ContactUsPage'));


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



const AdminRedirectComponent = () => {
    const navigate = useNavigate();
    const hasRedirected = useRef(false);

    useEffect(() => {
        if (hasRedirected.current) return;
        const adminUrl = process.env.REACT_APP_ADMIN_URL;
        if (adminUrl) {
            window.open(adminUrl, '_blank', 'noopener,noreferrer');
            hasRedirected.current = true;
        } else {
            console.error("Admin URL not found.");
        }
        navigate('/', { replace: true });
    }, [navigate]);

    return null;
};

 

// This is a new helper component to contain the main logic
// Replace your entire existing AppContent component with this one
const AppContent = () => {
    const { t } = useTranslation();
    const [categories, setCategories] = useState([]);
    // --- CHANGE 1: Initialize state with null instead of 'all' ---
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

    // --- CHANGE 2: Add this useEffect to sync state with the URL ---
    // useEffect(() => {
    //     // If the user is on the homepage, ensure activeCategory is null
    //     if (location.pathname === '/') {
    //         setActiveCategory(null);
    //     }
    // }, [location.pathname]);


    const handleCategoryChange = (category) => {
        setActiveCategory(category);
        setSearchQuery('');
        // --- CHANGE 3: Check for 'all' to set category to null ---
        if (category.toLowerCase() === 'all') {
            setActiveCategory('all');
            navigate('/');
        } else {
            const categorySlug = slugify(category);
            navigate(`/category/${categorySlug}`);
        }
    };

    const handleLogoClick = () => {
        // --- CHANGE 4: Set category to null instead of 'all' ---
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
                        <Route path="/cms" element={<AdminRedirectComponent />} />           
                     
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>

                {!isStandalonePage && <LanguageNudge />}
            </main>

            {isStandalonePage ? <MinimalFooter /> : <Footer1 />}
        </div>
    );
};

// The main App component now just wraps the logic in the Router
function App() {
    return (
        <BlogProvider>
            <AppContent />
        </BlogProvider>
    );
}

export default App;