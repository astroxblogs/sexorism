import axios from 'axios';
import { getAuthToken, removeAuthToken, setAuthToken } from '../utils/localStorage';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

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

// Authentication interceptor for admin functions
api.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token && config.url.includes('/admin/')) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        // Handle admin login response
        if (response.config.url.includes('/admin/login') && response.data.accessToken) {
            setAuthToken(response.data.accessToken);
            if (response.data.role) {
                try {
                    sessionStorage.setItem('astrox_admin_role_session', response.data.role);
                } catch (_) {}
            }
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401) {
            if (originalRequest.url.includes('/admin/login')) {
                if (error.response?.data?.message?.includes('deactivated')) {
                    return Promise.reject(error);
                }
                return Promise.reject(error);
            }

            if (originalRequest.url.includes('/admin/refresh-token')) {
                setAuthToken(null);
                processQueue(error);
                window.location.href = '/login';
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            isRefreshing = true;

            try {
                let refreshResponse;
                try {
                    refreshResponse = await api.post('/admin/refresh-token');
                } catch (cookieErr) {
                    const lastLogin = window.sessionStorage.getItem('astrox_last_refresh_token');
                    if (!lastLogin) throw cookieErr;
                    refreshResponse = await api.post('/admin/refresh-token',
                        { refreshToken: lastLogin },
                        { headers: { 'x-refresh-token': lastLogin } }
                    );
                }

                const newAccessToken = refreshResponse.data.accessToken;
                setAuthToken(newAccessToken);

                if (refreshResponse.data.role) {
                    try {
                        sessionStorage.setItem('astrox_admin_role_session', refreshResponse.data.role);
                    } catch (_) {}
                }

                processQueue(null, newAccessToken);
                isRefreshing = false;

                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return api(originalRequest);

            } catch (refreshError) {
                setAuthToken(null);
                processQueue(refreshError);
                isRefreshing = false;
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        if (error.response?.status === 403) {
            if (error.response?.data?.message?.includes('deactivated')) {
                setAuthToken(null);
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }

        console.error('Response Interceptor: Unhandled API error for', error.config?.url, ':', error.message);
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

/**
 * Gets a single blog by slug.
 * @param {string} slug The blog slug.
 * @returns {Promise<any>} The blog data.
 */
export const getBlogBySlug = async (slug) => {
    try {
        const response = await api.get(`/blogs/slug/${slug}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching blog by slug:', error);
        throw error;
    }
};

/**
 * Gets blogs for homepage feed.
 * @returns {Promise<any>} The homepage blogs data.
 */
export const getHomepageBlogs = async () => {
    try {
        const response = await api.get('/blogs/homepage-feed');
        return response.data;
    } catch (error) {
        console.error('Error fetching homepage blogs:', error);
        throw error;
    }
};

/**
 * Gets latest blogs.
 * @returns {Promise<any>} The latest blogs data.
 */
export const getLatestBlogs = async () => {
    try {
        const response = await api.get('/blogs/latest');
        return response.data;
    } catch (error) {
        console.error('Error fetching latest blogs:', error);
        throw error;
    }
};

/**
 * Gets all categories.
 * @returns {Promise<any>} The categories data.
 */
export const getCategories = async () => {
    try {
        const response = await api.get('/categories');
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

// Admin API Functions
export const setAccessToken = (token) => {
    if (token) {
        setAuthToken(token);
    } else {
        removeAuthToken();
    }
};

export const getAccessToken = () => {
    return getAuthToken();
};

// API Service Object for Admin functions
export const apiService = {
    // Authentication
    login: (credentials) => api.post('/admin/login', credentials),
    logout: () => api.post('/admin/logout'),

    // Operator Management
    getOperators: () => api.get('/admin/operators'),
    createOperator: (operatorData) => api.post('/admin/operators', operatorData),
    deleteOperator: (id) => api.delete(`/admin/operators/${id}`),
    toggleOperatorStatus: (id) => api.put(`/admin/operators/${id}/toggle`),

    // Credentials Management
    updateAdminCredentials: (credentials) => api.put('/admin/credentials', credentials),
    updateOperatorCredentials: (credentials) => api.put('/admin/operator/credentials', credentials),

    // Password Change (for modern UI)
    changeAdminPassword: (passwordData) => api.put('/admin/change-password', passwordData),
    changeOperatorPassword: (passwordData) => api.put('/admin/operator/change-password', passwordData),

    // Blog Management
    getBlogs: (config) => api.get('/admin/blogs', config),
    searchBlogs: (query, page = 1) => api.get(`/admin/blogs/search?q=${query}&page=${page}`),
    createBlog: (blogData) => api.post('/admin/blogs', blogData),
    updateBlog: (id, blogData) => api.put(`/admin/blogs/${id}`, blogData),
    deleteBlog: (id) => api.delete(`/admin/blogs/${id}`),
    updateBlogDate: (id, date) => api.put(`/admin/blogs/${id}/date`, { date }),
    getPendingBlogs: (config = {}) => api.get('/admin/blogs/pending', config),
    approveBlog: (id) => api.post(`/admin/blogs/${id}/approve`),
    rejectBlog: (id) => api.post(`/admin/blogs/${id}/reject`),

    // Category Management
    getCategories: () => api.get('/admin/categories'),
    createCategory: (categoryData) => api.post('/admin/categories', categoryData),
    updateCategory: (id, categoryData) => api.put(`/admin/categories/${id}`, categoryData),
    deleteCategory: (id) => api.delete(`/admin/categories/${id}`),

    // Subscriber Management
    getSubscribers: () => api.get('/admin/subscribers'),
    getSubscriberStats: () => api.get('/admin/subscribers/stats'),
};

export default api;