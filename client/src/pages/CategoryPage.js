import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Home from './Home';

const unslugify = (slug) => {
    // Base: convert hyphens to spaces and capitalize words
    const base = slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    // Fix known ampersand categories that lose the symbol when slugged
    if (/^health-?wellness$/i.test(slug)) return 'Health & Wellness';
    if (/^business-?finance$/i.test(slug)) return 'Business & Finance';
    if (/^food-?cooking$/i.test(slug)) return 'Food & Cooking';

    return base;
};

const CategoryPage = () => {
    const { categoryName } = useParams(); // Gets the category from the URL
    const activeCategory = unslugify(categoryName);

    // We reuse the Home component to display the filtered blogs
    return <Home activeCategory={activeCategory} />;
};

export default CategoryPage;