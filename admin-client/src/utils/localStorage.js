// astroxblogs-innvibs-admin-client/src/utils/localStorage.js

// This utility file is specifically for handling the admin's authentication token.
// It replaces the subscriber-related logic, which is only needed for the main blog.

const AUTH_TOKEN_KEY_BASE = 'astrox_admin_auth_token';
const ROLE_SESSION_KEY = 'astrox_admin_role_session';

const getCurrentRole = () => {
    try {
        const roleFromSession = sessionStorage.getItem(ROLE_SESSION_KEY);
        if (roleFromSession) return roleFromSession;
    } catch (_) {}
    return 'admin';
};

/**
 * Stores the admin's authentication token in localStorage.
 * @param {string} token - The JWT token received from the backend after login.
 */
export const setAuthToken = (token) => {
    try {
        const role = getCurrentRole();
        const key = `${AUTH_TOKEN_KEY_BASE}_${role}`;
        if (token) {
            localStorage.setItem(key, token);
           
        } else {
            console.warn('Attempted to set a null or undefined auth token.');
        }
    } catch (error) {
        console.error('Error saving admin auth token to localStorage:', error);
    }
};

/**
 * Retrieves the admin's authentication token from localStorage.
 * @returns {string | null} The token if found, otherwise null.
 */
export const getAuthToken = () => {
    try {
        const role = getCurrentRole();
        const key = `${AUTH_TOKEN_KEY_BASE}_${role}`;
        const token = localStorage.getItem(key);
        return token;
    } catch (error) {
        console.error('Error retrieving admin auth token from localStorage:', error);
        return null;
    }
};

/**
 * Removes the admin's authentication token from localStorage, effectively logging out the user.
 */
export const removeAuthToken = () => {
    try {
        const role = getCurrentRole();
        const key = `${AUTH_TOKEN_KEY_BASE}_${role}`;
        localStorage.removeItem(key);
       
    } catch (error) {
        console.error('Error removing admin auth token from localStorage:', error);
    }
};

/**
 * Checks if an admin authentication token exists in localStorage.
 * @returns {boolean} True if a token exists, false otherwise.
 */
export const hasAuthToken = () => {
    return !!getAuthToken();
};

// Export helpers in case other modules need them
export const getCurrentRoleForTab = getCurrentRole;
export const ROLE_KEYS = { ROLE_SESSION_KEY };