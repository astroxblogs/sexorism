import React, { useState, useEffect } from 'react'; // Added useEffect for potential body class toggle
import { setSubscriberId } from '../utils/localStorage';
import { subscribeUser } from '../services/api';


// NEW: Accept 'showPopup' and 'onClose' and 'onSubscribeSuccess' as props
const EmailSubscriptionPopup = ({ showPopup, onClose, onSubscribeSuccess }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Effect to manage body overflow and potential blur class on body
    useEffect(() => {
        if (showPopup) {
            document.body.style.overflow = 'hidden'; // Prevent scrolling when popup is open
        } else {
            document.body.style.overflow = ''; // Restore scrolling
        }

        // Cleanup function
        return () => {
            document.body.style.overflow = ''; // Ensure overflow is reset if component unmounts while popup is active
        };
    }, [showPopup]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); // Clear previous messages
        setIsSubmitting(true);

        // Basic client-side email validation
        if (!email || !email.includes('@') || !email.includes('.')) {
            setMessage('Please enter a valid email address.');
            setIsSubmitting(false);
            return;
        }

        try {
            const data = await subscribeUser(email);
            console.log('DEBUG (Popup): Backend response data after subscription:', data);

            // This block now handles a successful subscription
            if (data && data.subscriberId) {
                setSubscriberId(data.subscriberId);
                console.log('DEBUG (Popup): setSubscriberId called with:', data.subscriberId);

                // --- GTM UPDATE: Push event to dataLayer on SUCCESS ---
                if (window.dataLayer) {
                    window.dataLayer.push({
                        event: 'new_subscriber',
                        subscription_source: 'popup' // So you know where they signed up
                    });
                }
            } else {
                console.error('DEBUG (Popup): Backend response did NOT contain subscriberId:', data);
            }

            setMessage(data.msg || 'Thank you for subscribing!');
            setIsSuccess(true);

            if (onSubscribeSuccess) {
                onSubscribeSuccess();
            }

            setTimeout(() => {
                if (onClose) onClose();
            }, 1500);

        } catch (error) {
            console.error('DEBUG (Popup): Error during subscription API call in Popup:', error);
            setMessage(error.message || 'Subscription failed. Please try again.');
            setIsSuccess(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!showPopup) {
        return null;
    }

    return (
        // Added role="dialog" and aria-modal for accessibility
        <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[1000] p-4 backdrop-blur-sm" // Increased z-index significantly, added backdrop-blur-sm
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-8 w-full max-w-md relative animate-fade-in-scale"> {/* Added animation class (you'll need to define this in CSS) */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-200 text-2xl font-bold"
                    aria-label="Close popup"
                >
                    &times;
                </button>

                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white text-center">
                    Stay Updated with innvibs
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6 text-center">
                    Enter your email to get the latest blog posts directly in your inbox.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="sr-only">Email address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your.email@example.com"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                            required
                            disabled={isSubmitting || isSuccess}
                        />
                    </div>
                    <button
                        type="submit"
                        className={`w-full px-4 py-2 rounded-md font-semibold ${isSubmitting
                            ? 'bg-indigo-400 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                            } text-white transition-colors duration-200`}
                        disabled={isSubmitting || isSuccess}
                    >
                        {isSubmitting ? 'Subscribing...' : 'Subscribe Now'}
                    </button>
                </form>

                {message && (
                    <p className={`mt-4 text-center ${isSuccess ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

export default EmailSubscriptionPopup;
