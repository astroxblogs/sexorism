import axios from 'axios';

// The base URL for the main blog's server API
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.innvibs.com';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

// This interceptor is now only for the main blog's public API
api.interceptors.request.use(
    (config) => {
        // No authentication token is needed for the public-facing blog API
        console.log('Request Interceptor: Sending public request for', config.url);
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
        const response = await api.post('/api/subscribers', { email });
        return response.data;
    } catch (error) {
        console.error('Error during subscription API call:', error);
        throw error;
    }
};

export const trackUserLike = async (subscriberId, blogId) => {
    try {
        const response = await api.post('/api/subscribers/track/like', { subscriberId, blogId });
        return response.data;
    } catch (error) {
        console.error('Error tracking user like:', error);
        throw error;
    }
};

export const trackUserComment = async (subscriberId, blogId) => {
    try {
        const response = await api.post('/api/subscribers/track/comment', { subscriberId, blogId });
        return response.data;
    } catch (error) {
        console.error('Error tracking user comment:', error);
        throw error;
    }
};

export const trackUserRead = async (subscriberId, blogId, duration) => {
    try {
        const response = await api.post('/api/subscribers/track/read', { subscriberId, blogId, duration });
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
        const response = await api.post(`/api/blogs/${blogId}/share`);
        return response.data; // This will return { shareCount: newCount }
    } catch (error) {
        console.error('Error incrementing share count:', error);
        throw error;
    }
};

export default api;
