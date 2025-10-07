// ===============================
// Admin Authentication Management
// ===============================

const AUTH_TOKEN_KEY_BASE = 'astrox_admin_auth_token';
const ROLE_SESSION_KEY = 'astrox_admin_role_session';

// Helper: get current role safely
const getCurrentRole = () => {
  try {
    const roleFromSession = sessionStorage.getItem(ROLE_SESSION_KEY);
    if (roleFromSession) return roleFromSession;
  } catch (_) {}
  return 'admin';
};

/**
 * Stores the admin/operator authentication token.
 * ✅ Stores for both roles so the app can read it regardless of timing/order.
 */
export const setAuthToken = (token) => {
  try {
    if (!token) {
      console.warn('Attempted to set a null or undefined auth token.');
      return;
    }
    ['admin', 'operator'].forEach((r) => {
      localStorage.setItem(`${AUTH_TOKEN_KEY_BASE}_${r}`, token);
    });
  } catch (error) {
    console.error('Error saving auth token to localStorage:', error);
  }
};

/**
 * Retrieves the auth token from localStorage for the current role.
 */
export const getAuthToken = () => {
  try {
    const role = getCurrentRole();
    return localStorage.getItem(`${AUTH_TOKEN_KEY_BASE}_${role}`);
  } catch (error) {
    console.error('Error retrieving auth token from localStorage:', error);
    return null;
  }
};

/**
 * Removes all stored tokens (admin + operator) from localStorage.
 */
export const removeAuthToken = () => {
  try {
    ['admin', 'operator'].forEach((r) => {
      localStorage.removeItem(`${AUTH_TOKEN_KEY_BASE}_${r}`);
    });
  } catch (error) {
    console.error('Error removing auth token from localStorage:', error);
  }
};

/**
 * Checks if any auth token exists in localStorage.
 */
export const hasAuthToken = () => {
  return !!getAuthToken();
};

// ===============================
// Visitor ID Management
// ===============================

const VISITOR_ID_KEY = 'astrox_visitor_id';

export const getVisitorId = () => {
  try {
    let visitorId = localStorage.getItem(VISITOR_ID_KEY);
    if (!visitorId) {
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(VISITOR_ID_KEY, visitorId);
    }
    return visitorId;
  } catch (error) {
    console.error('Error managing visitor ID:', error);
    return `visitor_${Date.now()}`;
  }
};

export const clearVisitorId = () => {
  try {
    localStorage.removeItem(VISITOR_ID_KEY);
  } catch (error) {
    console.error('Error clearing visitor ID:', error);
  }
};

// ===============================
// Subscriber ID Management
// ===============================

const SUBSCRIBER_ID_KEY = 'astrox_subscriber_id';

export const getSubscriberId = () => {
  try {
    return localStorage.getItem(SUBSCRIBER_ID_KEY);
  } catch (error) {
    console.error('Error retrieving subscriber ID:', error);
    return null;
  }
};

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

export const hasSubscriberId = () => {
  return !!getSubscriberId();
};

export const removeSubscriberId = () => {
  try {
    localStorage.removeItem(SUBSCRIBER_ID_KEY);
  } catch (error) {
    console.error('Error removing subscriber ID:', error);
  }
};

// ===============================
// Exports for external usage
// ===============================

export const getCurrentRoleForTab = getCurrentRole;
export const ROLE_KEYS = { ROLE_SESSION_KEY };
