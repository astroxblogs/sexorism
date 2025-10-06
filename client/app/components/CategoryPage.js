'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';
import SEO from './SEO';
import HomePage from './HomePage';

const CategoryPage = ({ categoryName: propCategoryName }) => {
     const params = useParams(); // This is the URL slug, e.g., "health-wellness"
     const categoryName = propCategoryName || params?.categoryName; // Use prop if provided, otherwise use params
    const { i18n } = useTranslation();

    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // If categoryName is not available, show loading or error
    if (!categoryName) {
        return <div className="text-center py-20 text-lg dark:text-gray-200">Loading...</div>;
    }

    // ✅ STEP 1: Fetch specific category data for SEO purposes.
    useEffect(() => {
        const fetchCategoryData = async () => {
            setLoading(true);
            try {
                // We assume an API endpoint exists to get a category by its slug.
                // We will need to create this in the backend later.
                const res = await api.get(`/categories/${categoryName}`);
                setCategory(res.data);
            } catch (err) {
                setError('Category not found.');
                console.error("Error fetching category data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryData();
    }, [categoryName]);

    if (loading) {
        return <div className="text-center py-20 dark:text-gray-200">Loading category...</div>;
    }

    if (error || !category) {
        return <div className="text-center py-20 text-red-500">{error || 'Could not load category.'}</div>;
    }

    // ✅ STEP 2: Define schemas and SEO props using the fetched category data.
    const categoryNameCurrentLang = i18n.language === 'hi' ? category.name_hi : category.name_en;

    // Use a custom meta description if available, otherwise generate a default one.
    const metaDescription = category.metaDescription || `Explore the latest articles, news, and insights in the ${category.name_en} category on Innvibs. Stay updated with our in-depth posts.`;

    const collectionPageSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": `${category.name_en} Blogs - Innvibs`,
        "description": metaDescription,
        "url": `https://www.innvibs.com/category/${categoryName}`
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [{
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://www.innvibs.com"
        }, {
            "@type": "ListItem",
            "position": 2,
            "name": category.name_en, // Use the English name for consistency in schema
            "item": `https://www.innvibs.com/category/${categoryName}`
        }]
    };

    return (
        <>
            {/* ✅ STEP 3: Add the SEO component with dynamic data. */}
            <SEO
                title={`${categoryNameCurrentLang} Blogs - Latest Articles | Innvibs`}
                description={metaDescription}
                canonicalUrl={`/category/${categoryName}`}
                schema={[collectionPageSchema, breadcrumbSchema]}
            />

            {/* The HomePage component will get category from URL params in Next.js */}
            <HomePage />
        </>
    );
};

export default CategoryPage;