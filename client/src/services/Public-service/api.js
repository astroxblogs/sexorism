import axios from 'axios';
// Use relative URLs so Next.js rewrites can proxy to the backend
const api = axios.create({
    baseURL: '/api', // Use /api as baseURL for Next.js proxy
    withCredentials: true,
});

// Add request interceptor to log URLs for debugging
api.interceptors.request.use(
    (config) => {
        console.log('🚀 API Request:', config.method?.toUpperCase(), config.baseURL + config.url);
        return config;
    },
    (error) => {
        console.error('❌ API Request Error:', error);
        return Promise.reject(error);
    }
);

// This interceptor is now only for the main blog's public API
api.interceptors.request.use(
    (config) => {
        // No authentication token is needed for the public-facing blog API
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('Response Interceptor: Unhandled public API error for', error.config?.url, ':', error.message);
        return Promise.reject(error);
    }
);

// Functions for public-facing blog actions
export const subscribeUser = async (email) => {
    try {
        const response = await api.post('/subscribers', { email });
        return response.data;
    } catch (error) {
        console.error('Error during subscription API call:', error);
        throw error;
    }
};

export const trackUserLike = async (subscriberId, blogId) => {
    try {
        const response = await api.post('/subscribers/track/like', { subscriberId, blogId });
        return response.data;
    } catch (error) {
        console.error('Error tracking user like:', error);
        throw error;
    }
};

export const trackUserComment = async (subscriberId, blogId) => {
    try {
        const response = await api.post('/subscribers/track/comment', { subscriberId, blogId });
        return response.data;
    } catch (error) {
        console.error('Error tracking user comment:', error);
        throw error;
    }
};

export const trackUserRead = async (subscriberId, blogId, duration) => {
    try {
        const response = await api.post('/subscribers/track/read', { subscriberId, blogId, duration });
        return response.data;
    } catch (error) {
        console.error('Error tracking user read behavior:', error);
        throw error;
    }
};

/**
 * Increments the share count for a specific blog post.
 * @param {string} blogId The ID of the blog post to share.
 * @returns {Promise<{shareCount: number}>} A promise that resolves to an object with the new share count.
 */
export const incrementShareCount = async (blogId) => {
    try {
        const response = await api.post(`/blogs/${blogId}/share`);
        return response.data; // This will return { shareCount: newCount }
    } catch (error) {
        console.error('Error incrementing share count:', error);
        throw error;
    }
};


export const incrementBlogView = async (blogId) => {
    try {
        const response = await api.patch(`/blogs/${blogId}/views`);
        return response.data;
    } catch (error) {
        console.error('Error incrementing view count:', error);
        throw error;
    }
};


// --- NEW FUNCTIONS FOR ANONYMOUS LIKES AND COMMENTS ---

/**
 * Likes a post using a visitorId.
 * @param {string} blogId The ID of the blog post.
 * @param {string} visitorId The anonymous ID of the user.
 * @returns {Promise<{likes: number}>} The new like count.
 */
export const likePost = async (blogId, visitorId) => {
    try {
        const response = await api.post(`/blogs/${blogId}/like`, { visitorId });
        return response.data;
    } catch (error) {
        console.error('Error liking post:', error);
        throw error;
    }
};

/**
 * Unlikes a post using a visitorId.
 * @param {string} blogId The ID of the blog post.
 * @param {string} visitorId The anonymous ID of the user.
 * @returns {Promise<{likes: number}>} The new like count.
 */
export const unlikePost = async (blogId, visitorId) => {
    try {
        const response = await api.post(`/blogs/${blogId}/unlike`, { visitorId });
        return response.data;
    } catch (error) {
        console.error('Error unliking post:', error);
        throw error;
    }
};

/**
 * Adds a comment to a post using a visitorId.
 * @param {string} blogId The ID of the blog post.
 * @param {object} commentData - Contains visitorId, name, and comment text.
 * @returns {Promise<any>} The new comment object.
 */
export const addComment = async (blogId, commentData) => {
    try {
        const response = await api.post(`/blogs/${blogId}/comments`, commentData);
        return response.data;
    } catch (error) {
        console.error('Error adding comment:', error);
        throw error;
    }
};

/**
 * Gets a single blog by category and slug.
 * @param {string} categoryName The category name.
 * @param {string} slug The blog slug.
 * @returns {Promise<any>} The blog data.
 */
export const getBlogByCategoryAndSlug = async (categoryName, slug) => {
    try {
        const response = await api.get(`/blogs/${categoryName}/${slug}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching blog by category and slug:', error);
        throw error;
    }
};

export default api;