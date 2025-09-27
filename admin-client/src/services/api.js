import axios from 'axios';
import { setAuthToken, getAuthToken, removeAuthToken } from '../utils/localStorage';
console.log('API_BASE_URL:', process.env.REACT_APP_API_BASE_URL);
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

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

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

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

api.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
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
        if (response.config.url.includes('/api/admin/login') && response.data.accessToken) {
            setAccessToken(response.data.accessToken);
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
            if (originalRequest.url.includes('/api/admin/login')) {
                if (error.response?.data?.message?.includes('deactivated')) {
                    return Promise.reject(error);
                }
                return Promise.reject(error);
            }

            if (originalRequest.url.includes('/api/admin/refresh-token')) {
                setAccessToken(null);
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
                    refreshResponse = await api.post('/api/admin/refresh-token');
                } catch (cookieErr) {
                    const lastLogin = window.sessionStorage.getItem('astrox_last_refresh_token');
                    if (!lastLogin) throw cookieErr;
                    refreshResponse = await api.post('/api/admin/refresh-token', 
                        { refreshToken: lastLogin }, 
                        { headers: { 'x-refresh-token': lastLogin } }
                    );
                }
                
                const newAccessToken = refreshResponse.data.accessToken;
                setAccessToken(newAccessToken);

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
                setAccessToken(null);
                processQueue(refreshError);
                isRefreshing = false;
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        if (error.response?.status === 403) {
            if (error.response?.data?.message?.includes('deactivated')) {
                setAccessToken(null);
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

// API Service Object
export const apiService = {
    // Authentication
    login: (credentials) => api.post('/api/admin/login', credentials),
    logout: () => api.post('/api/admin/logout'),

    // Operator Management
    getOperators: () => api.get('/api/admin/operators'),
    createOperator: (operatorData) => api.post('/api/admin/operators', operatorData),
    deleteOperator: (id) => api.delete(`/api/admin/operators/${id}`),
    toggleOperatorStatus: (id) => api.put(`/api/admin/operators/${id}/toggle`),

    // Credentials Management
    updateAdminCredentials: (credentials) => api.put('/api/admin/credentials', credentials),
    updateOperatorCredentials: (credentials) => api.put('/api/admin/operator/credentials', credentials),

    // Password Change (for modern UI)
    changeAdminPassword: (passwordData) => api.put('/api/admin/change-password', passwordData),
    changeOperatorPassword: (passwordData) => api.put('/api/admin/operator/change-password', passwordData),
    
    // ==========================================================
    // ============== ADDED FUNCTIONALITY START =================
    // ==========================================================



  
    // Blog Management

       getBlogs: (config) => api.get('/api/admin/blogs', config),
    searchBlogs: (query, page = 1) => api.get(`/api/admin/blogs/search?q=${query}&page=${page}`),
    createBlog: (blogData) => api.post('/api/admin/blogs', blogData),
    updateBlog: (id, blogData) => api.put(`/api/admin/blogs/${id}`, blogData),
    deleteBlog: (id) => api.delete(`/api/admin/blogs/${id}`),
    updateBlogDate: (id, date) => api.put(`/api/admin/blogs/${id}/date`, { date }),
    getPendingBlogs: (config = {}) => api.get('/api/admin/blogs/pending', config),
    approveBlog: (id) => api.post(`/api/admin/blogs/${id}/approve`),
    rejectBlog: (id) => api.post(`/api/admin/blogs/${id}/reject`),
    // ==========================================================
    // =============== ADDED FUNCTIONALITY END ==================
    // ==========================================================
    
    // Subscriber Management
    getSubscribers: () => api.get('/api/admin/subscribers'),
    getSubscriberStats: () => api.get('/api/admin/subscribers/stats'), // Optional, if you want stats later
};

export default api;