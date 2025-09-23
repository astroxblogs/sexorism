import React, { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './index.css';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { useTranslation } from 'react-i18next';

import Footer1 from './components/Footer1';
import TopNavigation from './components/TopNavigation';
import Home from './pages/Home';
import ScrollToTop from './components/ScrollToTop';
import GtmTracker from './components/GtmTracker';
import LanguageNudge from './components/LanguageNudge.jsx';

const BlogDetailPage = React.lazy(() => import('./pages/BlogDetailPage'));
const CategoryPage = React.lazy(() => import('./pages/CategoryPage'));
const TagPage = React.lazy(() => import('./pages/TagPage'));

// Base URL is now set in the api service

axios.interceptors.request.use(
    (config) => {
        const cloudinaryUploadUrl = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`;
        if (config.url && !config.url.startsWith(cloudinaryUploadUrl)) {

        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const slugify = (text) => {
    const normalized = text.replace(/\s*&\s*/g, ' & ');
    return normalized
        .toLowerCase()
        .replace(/\s*&\s*/g, ' & ') // keep a consistent space-around-& for mapping
        .replace(/ & /g, '-')
        .replace(/\s+/g, '-');
};

const AdminRedirectComponent = () => {
    const navigate = useNavigate();
    const hasRedirected = useRef(false);

    useEffect(() => {

        if (hasRedirected.current) {
            return;
        }

        const adminUrl = process.env.REACT_APP_ADMIN_URL;
        if (adminUrl) {
            // Open the admin URL in a new tab
            window.open(adminUrl, '_blank', 'noopener,noreferrer');
            hasRedirected.current = true;
        } else {
            console.error("Admin URL not found in environment variables.");
        }

        navigate('/', { replace: true });

    }, [navigate]);

    return null;
};
// -----------------------------------------------------

function App() {
    const { t } = useTranslation();
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();


    const fetchCategories = useCallback(async () => {
        try {
            const baseUrl = process.env.REACT_APP_API_BASE_URL || 'https://api.innvibs.com';
            const response = await axios.get(`${baseUrl.replace(/\/$/, '')}/api/blogs/categories`);
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            // Fallback: try without base URL
            try {
                const response = await axios.get('/api/blogs/categories');
                setCategories(response.data);
            } catch (fallbackError) {
                console.error('Fallback API call also failed:', fallbackError);
            }
        }
    }, []);


    useEffect(() => {
        const isAdminPath = window.location.pathname === "/admin";
        const isMainDomain =
            window.location.hostname === "www.innvibs.com" ||
            window.location.hostname === "innvibs.com";

        if (isAdminPath && isMainDomain) {
            window.open(process.env.REACT_APP_ADMIN_URL, "_blank");
        }
    }, []);


    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleCategoryChange = (category) => {
        setActiveCategory(category);
        setSearchQuery('');
        if (category.toLowerCase() === 'all') {
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
            <TopNavigation
                activeCategory={activeCategory}
                onCategoryChange={handleCategoryChange}
                setSearchQuery={setSearchQuery}
                onLogoClick={handleLogoClick}
                categories={categories}
            />
            <main className="flex-1 overflow-y-auto">
                <Suspense fallback={<div className="text-center py-20 dark:text-gray-200">{t('loading page')}</div>}>
                    <Routes>
                        <Route path="/" element={<Home activeCategory={activeCategory} searchQuery={searchQuery} />} />
                        <Route path="/category/:categoryName" element={<CategoryPage />} />
                        <Route path="/category/:categoryName/:blogSlug" element={<BlogDetailPage />} />
                        <Route path="/tag/:tagName" element={<TagPage />} />
                        {/* <Route path="/blog-detail/:slug" element={<BlogDetailPage />} /> */}
                        <Route path="/admin" element={<AdminRedirectComponent />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
                <LanguageNudge />
            </main>
            <Footer1 />
        </div>
    );
}

export default App;