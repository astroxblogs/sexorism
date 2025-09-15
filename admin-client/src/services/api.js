import axios from 'axios';
import { setAuthToken, getAuthToken, removeAuthToken } from '../utils/localStorage';
console.log('API_BASE_URL from environment is:', process.env.REACT_APP_API_BASE_URL)
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
    console.log('setAccessToken called. Token is now:', token ? '[SET]' : null);
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
        } else {
            console.log('Request Interceptor: Sending request for', config.url, 'without token.');
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
            // console.log('Response Interceptor: Access token received from login and set.');
            if (response.data.role) {
                try { sessionStorage.setItem('astrox_admin_role_session', response.data.role); } catch (_) {}
            }
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401) {
            if (originalRequest.url.includes('/api/admin/login')) {
                // 🔥 ENHANCED: Handle deactivated account message
                if (error.response?.data?.message?.includes('deactivated')) {
                    return Promise.reject(error);
                }
                return Promise.reject(error);
            }

            if (originalRequest.url.includes('/api/admin/refresh-token')) {
                console.error('Response Interceptor: Refresh token request failed with 401. Logging out.');
                setAccessToken(null);
                processQueue(error);
                window.location.href = '/login';
                return Promise.reject(error);
            }

            if (isRefreshing) {
                console.log('Response Interceptor: Refresh in progress, queuing original request.');
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
            console.log('Response Interceptor: Caught 401 error. Attempting token refresh...');

            try {
                let refreshResponse;
                try {
                    refreshResponse = await api.post('/api/admin/refresh-token');
                } catch (cookieErr) {
                    const lastLogin = window.sessionStorage.getItem('astrox_last_refresh_token');
                    if (!lastLogin) throw cookieErr;
                    refreshResponse = await api.post('/api/admin/refresh-token', { refreshToken: lastLogin }, { headers: { 'x-refresh-token': lastLogin } });
                }
                const newAccessToken = refreshResponse.data.accessToken;

                setAccessToken(newAccessToken);
                console.log('Response Interceptor: Token refreshed successfully.');

                if (refreshResponse.data.role) {
                    try { sessionStorage.setItem('astrox_admin_role_session', refreshResponse.data.role); } catch (_) {}
                }

                processQueue(null, newAccessToken);
                isRefreshing = false;

                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return api(originalRequest);

            } catch (refreshError) {
                console.error('Response Interceptor: Refresh token failed. Redirecting to login.', refreshError);
                setAccessToken(null);
                processQueue(refreshError);
                isRefreshing = false;
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        if (error.response?.status === 403) {
            console.error('Response Interceptor: 403 Forbidden.', error.response?.data);
            // 🔥 ENHANCED: Handle account deactivated during session
            if (error.response?.data?.message?.includes('deactivated')) {
                setAccessToken(null);
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }

        console.log('Response Interceptor: Unhandled error caught for', error.config?.url, ':', error.message);
        return Promise.reject(error);
    }
);


// --- API FUNCTIONS ---
// Group API calls in an object for cleaner exporting and usage.
export const apiService = {
  // Authentication
  login: (credentials) => api.post('/api/admin/login', credentials),
  logout: () => api.post('/api/admin/logout'),

  // Operator Management
  getOperators: () => api.get('/api/admin/operators'),
  createOperator: (operatorData) => api.post('/api/admin/operators', operatorData),
  deleteOperator: (id) => api.delete(`/api/admin/operators/${id}`),
  // 🔥 NEW: Toggle operator active/inactive status
  toggleOperatorStatus: (id) => api.put(`/api/admin/operators/${id}/toggle`),

  // Credentials Management
  updateAdminCredentials: (credentials) => api.put('/api/admin/credentials', credentials),
  updateOperatorCredentials: (credentials) => api.put('/api/admin/operator/credentials', credentials),

  // Blog Management
  getPendingBlogs: (config = {}) => api.get('/api/admin/blogs/pending', config),
};


export default api;