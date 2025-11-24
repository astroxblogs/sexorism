import { v4 as uuidv4 } from 'uuid'; // ADDED: Import the UUID generator

const SUBSCRIBER_ID_KEY = 'astrox_subscriber_id';
const VISITOR_ID_KEY = 'Sexorism_visitor_id'; // ADDED: New key for the anonymous ID

/**
 * Stores the subscriber ID in localStorage.
 * @param {string} subscriberId - The unique ID received from the backend.
 */
export const setSubscriberId = (subscriberId) => {

    console.log('DEBUG (localStorage): Attempting to set subscriberId:', subscriberId);
    if (!subscriberId) {
        console.error('DEBUG (localStorage): Attempted to set null/undefined subscriberId.');
        return;
    }
    try {
        localStorage.setItem(SUBSCRIBER_ID_KEY, subscriberId);
        console.log('DEBUG (localStorage): Subscriber ID successfully set in localStorage.');
    } catch (error) {
        console.error('DEBUG (localStorage): Error saving subscriber ID to localStorage:', error);
    }
}

/**
 * Retrieves the subscriber ID from localStorage.
 * @returns {string | null} The subscriber ID if found, otherwise null.
 */
export const getSubscriberId = () => {
    try {
        const id = localStorage.getItem(SUBSCRIBER_ID_KEY);
        console.log('DEBUG (localStorage): Retrieved subscriberId:', id);
        return id;
    } catch (error) {
        console.error('DEBUG (localStorage): Error retrieving subscriber ID from localStorage:', error);
        return null;
    }
};

/**
 * Removes the subscriber ID from localStorage (e.g., for testing or if user unsubscribes).
 */
export const removeSubscriberId = () => {
    try {
        localStorage.removeItem(SUBSCRIBER_ID_KEY);
    } catch (error) {
        console.error('Error removing subscriber ID from localStorage:', error);

    }
};

/**
 * Checks if a subscriber ID exists in localStorage.
 * @returns {boolean} True if subscriber ID exists, false otherwise.
 */
export const hasSubscriberId = () => {
    const hasId = !!getSubscriberId();
    console.log('DEBUG (localStorage): hasSubscriberId check:', hasId);
    return hasId;
};

// --- NEW FUNCTION ADDED ---

/**
 * Retrieves a persistent, anonymous visitor ID from localStorage.
 * If one doesn't exist, it creates and stores one.
 * @returns {string} The unique visitor ID.
 */
export const getVisitorId = () => {
    try {
        let visitorId = localStorage.getItem(VISITOR_ID_KEY);

        // If no ID exists, create one
        if (!visitorId) {
            visitorId = uuidv4(); // Generate a new unique ID
            localStorage.setItem(VISITOR_ID_KEY, visitorId);
            console.log('DEBUG (localStorage): New visitorId created:', visitorId);
        }

        return visitorId;
    } catch (error) {
        console.error('DEBUG (localStorage): Error handling visitor ID:', error);
        // Fallback to a temporary ID if localStorage fails
        return 'temp-visitor-id-error';
    }
};