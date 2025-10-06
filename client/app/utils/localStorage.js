// Admin authentication token management utility
// This utility file is specifically for handling the admin's authentication token.

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

// Visitor ID management for anonymous users
const VISITOR_ID_KEY = 'astrox_visitor_id';

/**
 * Generates or retrieves a visitor ID for anonymous users.
 * @returns {string} The visitor ID.
 */
export const getVisitorId = () => {
    try {
        let visitorId = localStorage.getItem(VISITOR_ID_KEY);
        if (!visitorId) {
            // Generate a simple visitor ID based on timestamp and random number
            visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem(VISITOR_ID_KEY, visitorId);
        }
        return visitorId;
    } catch (error) {
        console.error('Error managing visitor ID:', error);
        return `visitor_${Date.now()}`;
    }
};

/**
 * Clears the visitor ID (useful for testing or logout).
 */
export const clearVisitorId = () => {
    try {
        localStorage.removeItem(VISITOR_ID_KEY);
    } catch (error) {
        console.error('Error clearing visitor ID:', error);
    }
};

// Subscriber ID management for subscription features
const SUBSCRIBER_ID_KEY = 'astrox_subscriber_id';

/**
 * Gets the subscriber ID from localStorage.
 * @returns {string | null} The subscriber ID if found, otherwise null.
 */
export const getSubscriberId = () => {
    try {
        return localStorage.getItem(SUBSCRIBER_ID_KEY);
    } catch (error) {
        console.error('Error retrieving subscriber ID:', error);
        return null;
    }
};

/**
 * Sets the subscriber ID in localStorage.
 * @param {string} subscriberId - The subscriber ID to store.
 */
export const setSubscriberId = (subscriberId) => {
    try {
        if (subscriberId) {
            localStorage.setItem(SUBSCRIBER_ID_KEY, subscriberId);
        } else {
            console.warn('Attempted to set a null or undefined subscriber ID.');
        }
    } catch (error) {
        console.error('Error saving subscriber ID:', error);
    }
};

/**
 * Checks if a subscriber ID exists in localStorage.
 * @returns {boolean} True if a subscriber ID exists, false otherwise.
 */
export const hasSubscriberId = () => {
    return !!getSubscriberId();
};

/**
 * Removes the subscriber ID from localStorage.
 */
export const removeSubscriberId = () => {
    try {
        localStorage.removeItem(SUBSCRIBER_ID_KEY);
    } catch (error) {
        console.error('Error removing subscriber ID:', error);
    }
};

// Export helpers in case other modules need them
export const getCurrentRoleForTab = getCurrentRole;
export const ROLE_KEYS = { ROLE_SESSION_KEY };