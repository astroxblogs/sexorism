import React, { createContext, useState, useCallback, useContext } from 'react';

// Create the context
const BlogContext = createContext();

// Create a custom hook for easy access to the context
export const useBlogs = () => useContext(BlogContext);

// Create the Provider component that will wrap our app
export const BlogProvider = ({ children }) => {
    const [blogs, setBlogs] = useState([]);
    const [featuredBlogs, setFeaturedBlogs] = useState([]);

    // This function will become our single source of truth for updating a blog's state
    const updateBlog = useCallback((updatedBlog) => {
        // Update the main blogs list
        setBlogs(currentBlogs =>
            currentBlogs.map(blog =>
                blog._id === updatedBlog._id ? updatedBlog : blog
            )
        );
        // Also update the featured blogs list, if the blog is present there
        setFeaturedBlogs(currentBlogs =>
            currentBlogs.map(blog =>
                blog._id === updatedBlog._id ? updatedBlog : blog
            )
        );
    }, []);

    // The value that will be available to all child components
    const value = {
        blogs,
        setBlogs,
        featuredBlogs,
        setFeaturedBlogs,
        updateBlog
    };

    return (
        <BlogContext.Provider value={value}>
            {children}
        </BlogContext.Provider>
    );
};