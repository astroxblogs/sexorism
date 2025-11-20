import axios from 'axios';
import { getAuthToken, removeAuthToken, setAuthToken } from '../utils/localStorage';

let isRefreshing = false;
let failedQueue = [];
let activeLang = 'en';
export const setApiLanguage = (lng) => { activeLang = lng || 'en'; };

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => (error ? prom.reject(error) : prom.resolve(token)));
  failedQueue = [];
};

function hasRefreshToken() {
  try {
    const fromSession = window.sessionStorage.getItem('astrox_last_refresh_token');
    const fromCookie = document.cookie.split('; ').some(c => c.startsWith('refreshToken='));
    return !!fromSession || !!fromCookie;
  } catch {
    return false;
  }
}


// Normalize category names to your clean route slugs
export const toCategorySlug = (text) => String(text || '')
  .toLowerCase()
  .replace(/\s*&\s*/g, '-and-')  // preserve "&" as "-and-"
  .replace(/\s+/g, '-')          // spaces → hyphen
  .replace(/[^a-z0-9\-]/g, '')   // keep a–z, 0–9 and hyphen only
  .replace(/-+/g, '-')           // collapse hyphens
  .replace(/^-+|-+$/g, '');      // trim




  // >>> normalize API base so it always points to the real /api root
const RAW_BASE = (process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/+$/, ''); // trim trailing /
const RESOLVED_BASE =
  RAW_BASE
    ? (RAW_BASE.endsWith('/api') ? RAW_BASE : `${RAW_BASE}/api`)
    : '/api'; // fallback to relative in dev

const api = axios.create({
  baseURL: RESOLVED_BASE,
  withCredentials: true,
});

// request logging (optional)
// --- keep your imports and existing code ---

api.interceptors.request.use(
  (config) => {
    // existing admin token attach…
    const token = getAuthToken();
    if (token && config.url?.includes('/admin/')) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // PUBLIC endpoints: attach language + query param
    const isPublic =
      config.url &&
      !config.url.includes('/admin/') &&
      (config.url.startsWith('/blogs') ||
       config.url.startsWith('/categories') ||
       config.url.startsWith('/subscribers'));

    if (isPublic) {
      // Robust language source: setApiLanguage() → cookie → localStorage → 'en'
      let lng = activeLang;
      if (!lng && typeof document !== 'undefined') {
        const m = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=(hi|en)/i);
        if (m && m[1]) lng = m[1].toLowerCase();
        if (!lng) {
          try { lng = (localStorage.getItem('lang') || '').toLowerCase(); } catch {}
        }
      }
      if (lng !== 'hi') lng = 'en';

      config.headers['Accept-Language'] = lng;

      if ((config.method || 'get').toLowerCase() === 'get') {
        // If config.url is relative, normalize with a dummy base; if absolute, use as-is
        const isAbsolute = /^https?:\/\//i.test(config.url || '');
        const url = new URL(config.url, isAbsolute ? undefined : 'http://dummy');
        if (!url.searchParams.has('lang')) url.searchParams.set('lang', lng);
        // Preserve path + query exactly; avoids double "?" or stripping params
        const qs = url.searchParams.toString();
      if (isAbsolute) {
         config.url = qs ? `${url.origin}${url.pathname}?${qs}` : `${url.origin}${url.pathname}`;
       } else {
         config.url = qs ? `${url.pathname}?${qs}` : url.pathname;
        }
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);



// responses
api.interceptors.response.use(
  (response) => {
    // ✅ login success: set role first, then token
    if (response.config?.url?.includes('/admin/login') && response.data?.accessToken) {
      if (response.data.role) {
        try { sessionStorage.setItem('astrox_admin_role_session', response.data.role); } catch {}
      }
      setAuthToken(response.data.accessToken);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401) {
    // ⛔ IMPORTANT: do NOT redirect/refresh on verify-token failures.
    // Let /cms decide to show the login UI without causing a loop.
    if (originalRequest?.url?.includes('/admin/verify-token')) {
      try { sessionStorage.removeItem('astrox_admin_role_session'); } catch {}
      return Promise.reject(error);
    }

      // if already retried once, stop
      if (originalRequest?.__isRetryRequest) {
        removeAuthToken();
        try { sessionStorage.removeItem('astrox_admin_role_session'); } catch {}
        if (typeof window !== 'undefined' && window.location.pathname !== '/cms') window.location.href = '/cms';
        return Promise.reject(error);
      }

      // never try to refresh for login endpoint
      if (originalRequest?.url?.includes('/admin/login')) return Promise.reject(error);

      // if refresh endpoint itself 401s
      if (originalRequest?.url?.includes('/admin/refresh-token')) {
        removeAuthToken();
        processQueue(error);
        try { sessionStorage.removeItem('astrox_admin_role_session'); } catch {}
        if (typeof window !== 'undefined' && window.location.pathname !== '/cms') window.location.href = '/cms';
        return Promise.reject(error);
      }

      // no refresh token? go to /cms once
      if (!hasRefreshToken()) {
        removeAuthToken();
        processQueue(error);
        isRefreshing = false;
        try { sessionStorage.removeItem('astrox_admin_role_session'); } catch {}
        if (typeof window !== 'undefined' && window.location.pathname !== '/cms') window.location.href = '/cms';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        originalRequest.__isRetryRequest = true;

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

        const newAccessToken = refreshResponse.data?.accessToken;

        if (refreshResponse.data?.role) {
          try { sessionStorage.setItem('astrox_admin_role_session', refreshResponse.data.role); } catch {}
        }
        setAuthToken(newAccessToken);

        processQueue(null, newAccessToken);
        isRefreshing = false;

        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        removeAuthToken();
        processQueue(refreshError);
        isRefreshing = false;
        try { sessionStorage.removeItem('astrox_admin_role_session'); } catch {}
        if (typeof window !== 'undefined' && window.location.pathname !== '/cms') window.location.href = '/cms';
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 403) {
      if (error.response?.data?.message?.includes('deactivated')) {
        removeAuthToken();
        try { sessionStorage.removeItem('astrox_admin_role_session'); } catch {}
        if (typeof window !== 'undefined' && window.location.pathname !== '/cms') window.location.href = '/cms';
      }
      return Promise.reject(error);
    }

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
 * Gets a single blog by category and slug, localized by language.
 * @param {string} categoryName
 * @param {string} slug
 * @param {object} options - { lang?: string, signal?: AbortSignal }
 */
export const getBlogByCategoryAndSlug = async (
  categoryName,
  slug,
  lang, // Accept lang as the third parameter directly
  options = {}
) => {
  try {
    const { signal } = options;
    const params = new URLSearchParams();
    if (lang) params.set('lang', lang);

    const url =
      `/blogs/${encodeURIComponent(categoryName)}/${encodeURIComponent(slug)}` +
      (params.toString() ? `?${params.toString()}` : '');

    // The interceptor also adds these, but being explicit here is safer.
    const response = await api.get(url, {
      signal,
      headers: lang ? { 'Accept-Language': lang } : undefined,
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching blog by category and slug:', error);
    throw error;
  }
};


// Get categories for public pages, normalized to { name, slug }
export const getPublicCategoryList = async ({ lang, signal } = {}) => {
  const res = await api.get('/categories' + (lang ? `?lang=${lang}` : ''), {
    signal,
    headers: lang ? { 'Accept-Language': lang } : undefined,
  });

  const raw = res.data?.payload?.data ?? res.data?.data ?? res.data ?? [];
  if (!Array.isArray(raw)) return [];

  return raw
    .map((c) => {
      const name =
        c?.name ??
        c?.displayName ??
        c?.name_en ??
        c?.name_hi ??
        c?.label ??
        c?.title ??
        c?.categoryName ??
        '';

      const slug = toCategorySlug(c?.slug ?? name);
      return name && slug ? { name, slug } : null;
    })
    .filter(Boolean);
};




/**
 * Gets a single blog by slug.
 * @param {string} slug The blog slug.
 * @returns {Promise<any>} The blog data.
 */
export const getBlogBySlug = async (slug, { lang, signal } = {}) => {
  try {
    const params = new URLSearchParams();
    if (lang) params.set('lang', lang);

    const url =
      `/blogs/slug/${encodeURIComponent(slug)}` +
      (params.toString() ? `?${params.toString()}` : '');

    const response = await api.get(url, {
      signal,
      headers: lang ? { 'Accept-Language': lang } : undefined,
    });

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
export const getHomepageBlogs = async (opts = {}) => {
  const { signal, lang } = opts;
  const res = await api.get('/blogs/homepage-feed' + (lang ? `?lang=${lang}` : ''), {
    signal,
    headers: lang ? { 'Accept-Language': lang } : undefined,
  });
  return res.data;
};

/**
 * Gets latest blogs.
 * @returns {Promise<any>} The latest blogs data.
 */
export const getLatestBlogs = async (opts = {}) => {
  const { signal, lang } = opts;
  const res = await api.get('/blogs/latest' + (lang ? `?lang=${lang}` : ''), {
    signal,
    headers: lang ? { 'Accept-Language': lang } : undefined,
  });
  return res.data;
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


// Get ONE category by slug (returns metaTitle/metaDescription too)
export const getCategoryBySlug = async (slug, { lang, signal } = {}) => {
  const params = new URLSearchParams();
  if (lang) params.set('lang', lang);

  // Try common endpoint shapes; keep whichever one your API uses
  const paths = [
    `/categories/slug/${encodeURIComponent(slug)}`,
    `/categories/by-slug/${encodeURIComponent(slug)}`
  ];

  let lastErr;
  for (const p of paths) {
    try {
      const url = p + (params.toString() ? `?${params.toString()}` : '');
      const res = await api.get(url, {
        signal,
        headers: lang ? { 'Accept-Language': lang } : undefined,
      });
      // adapt if your payload wraps data
      return res.data?.payload?.data ?? res.data?.data ?? res.data;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('Category not found');
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
// client
deactivateBlog: (id) => api.post(`/admin/blogs/${id}/deactivate`),

    // Category Management
    getCategories: () => api.get('/admin/categories'),
    createCategory: (categoryData) => api.post('/admin/categories', categoryData),
    updateCategory: (id, categoryData) => api.put(`/admin/categories/${id}`, categoryData),
    deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
    uploadCategoryImage: (formData) => api.post('/admin/categories/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

    // Subscriber Management
    getSubscribers: () => api.get('/admin/subscribers'),
    getSubscriberStats: () => api.get('/admin/subscribers/stats'),
};

export default api;