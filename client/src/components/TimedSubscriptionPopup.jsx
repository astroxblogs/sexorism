import React, { useState, useEffect } from 'react';
import { setSubscriberId } from '../utils/localStorage';
import { subscribeUser } from '../services/api';

const TimedSubscriptionPopup = ({ showPopup, onClose, onSubscribeSuccess }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Effect to manage body overflow and smooth popup animation
    useEffect(() => {
        if (showPopup) {
            document.body.style.overflow = 'hidden';
            // Trigger animation after a brief delay for smooth entrance
            setTimeout(() => setIsVisible(true), 50);
        } else {
            document.body.style.overflow = '';
            setIsVisible(false);
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [showPopup]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsSubmitting(true);

        // Enhanced email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            setMessage('Please enter a valid email address.');
            setIsSubmitting(false);
            return;
        }

        try {
            const data = await subscribeUser(email);
            console.log('DEBUG (TimedPopup): Backend response data after subscription:', data);

            if (data && data.subscriberId) {
                setSubscriberId(data.subscriberId);
                console.log('DEBUG (TimedPopup): setSubscriberId called with:', data.subscriberId);

                // GTM tracking for timed popup subscriptions
                if (window.dataLayer) {
                    window.dataLayer.push({
                        event: 'new_subscriber',
                        subscription_source: 'timed_popup'
                    });
                }
            } else {
                console.error('DEBUG (TimedPopup): Backend response did NOT contain subscriberId:', data);
            }

            setMessage(data.msg || '🎉 Welcome to the Innvibs community!');
            setIsSuccess(true);

            if (onSubscribeSuccess) {
                onSubscribeSuccess();
            }

            setTimeout(() => {
                if (onClose) onClose();
            }, 2000);

        } catch (error) {
            console.error('DEBUG (TimedPopup): Error during subscription API call:', error);
            setMessage(error.message || 'Oops! Something went wrong. Please try again.');
            setIsSuccess(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            if (onClose) onClose();
        }, 300); // Wait for animation to complete
    };

    if (!showPopup) {
        return null;
    }

    return (
        <div
            className={`fixed inset-0 bg-gradient-to-br from-black/80 via-purple-900/50 to-black/80 flex items-center justify-center z-[1000] p-4 transition-all duration-500 ${
                isVisible ? 'backdrop-blur-md opacity-100' : 'backdrop-blur-none opacity-0'
            }`}
            role="dialog"
            aria-modal="true"
            style={{ 
                background: isVisible ? 
                'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.1) 0%, rgba(0, 0, 0, 0.8) 70%)' : 
                'transparent'
            }}
        >
            <div 
                className={`bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-3xl shadow-2xl p-8 md:p-10 w-full max-w-lg relative border border-gray-200/50 dark:border-gray-700/50 transition-all duration-500 transform ${
                    isVisible ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'
                }`}
                style={{
                    boxShadow: isVisible ? 
                    '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 100px -20px rgba(99, 102, 241, 0.3)' : 
                    'none'
                }}
            >
                {/* Animated gradient background elements */}
                <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-xl animate-pulse"></div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-xl animate-pulse delay-1000"></div>
                </div>

                {/* Close button with modern design */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 w-10 h-10 bg-gray-100/80 dark:bg-gray-700/80 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-200 backdrop-blur-sm group"
                    aria-label="Close popup"
                >
                    <svg className="w-5 h-5 transform group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>

                {/* Main content */}
                <div className="relative z-10 text-center">
                    {/* Logo/Brand section */}
                    <div className="mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                            </svg>
                        </div>
                        
                        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-2">
                            Join the <span className="font-extrabold">Innvibs</span> Revolution!
                        </h2>
                        
                        <div className="space-y-1">
                            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                ✨ Ignite Innovation • Vibrate with Ideas ✨
                            </p>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                Where curiosity meets breakthrough insights
                            </p>
                        </div>
                    </div>

                    {/* Value proposition */}
                    <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
                        <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                            🚀 <strong>Don't miss out!</strong> Join <span className="font-semibold text-blue-600 dark:text-blue-400">50,000+</span> innovators who get exclusive insights, trending topics, and game-changing ideas delivered straight to their inbox.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                                <span className="text-green-500 mr-2">✓</span> Weekly insights
                            </div>
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                                <span className="text-green-500 mr-2">✓</span> Exclusive content
                            </div>
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                                <span className="text-green-500 mr-2">✓</span> Early access
                            </div>
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                                <span className="text-green-500 mr-2">✓</span> No spam, ever
                            </div>
                        </div>
                    </div>

                    {/* Subscription form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                                </svg>
                            </div>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email to unlock insights"
                                className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-base transition-all duration-200"
                                required
                                disabled={isSubmitting || isSuccess}
                            />
                        </div>
                        
                        <button
                            type="submit"
                            className={`w-full py-4 px-6 rounded-xl font-bold text-white text-lg transition-all duration-300 transform ${
                                isSubmitting
                                    ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'
                                    : isSuccess 
                                    ? 'bg-gradient-to-r from-green-500 to-green-600 scale-105'
                                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 hover:shadow-xl active:scale-95'
                            } shadow-lg`}
                            disabled={isSubmitting || isSuccess}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Joining the Revolution...</span>
                                </div>
                            ) : isSuccess ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    <span>Welcome Aboard! 🎉</span>
                                </div>
                            ) : (
                                <span>🚀 Join Innvibs - It's Free!</span>
                            )}
                        </button>
                    </form>

                    {/* Message display */}
                    {message && (
                        <div className={`mt-4 p-3 rounded-lg text-center font-medium transition-all duration-300 ${
                            isSuccess 
                                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700' 
                                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700'
                        }`}>
                            {message}
                        </div>
                    )}

                    {/* Trust signals */}
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            🔒 Your privacy is sacred. Unsubscribe anytime with one click.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimedSubscriptionPopup;