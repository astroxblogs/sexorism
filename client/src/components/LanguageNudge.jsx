import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

// A small, dismissible popup that nudges users to read in Hindi if current language is English.
// Non-intrusive: shows once per day unless dismissed earlier.
const LanguageNudge = () => {
    const { i18n } = useTranslation();
    const [visible, setVisible] = useState(false);
    const boxRef = useRef(null);

    useEffect(() => {
        // Only nudge when current language is English
        if (i18n.language !== 'en') return;
        const lastDismiss = localStorage.getItem('lang_nudge_dismissed_at');
        const now = Date.now();
        if (lastDismiss && now - Number(lastDismiss) < 24 * 60 * 60 * 1000) return;
        const t = setTimeout(() => setVisible(true), 2500); // wait a bit after page load
        return () => clearTimeout(t);
    }, [i18n.language]);

    useEffect(() => {
        if (!visible) return;
        const el = boxRef.current;
        if (!el) return;
        const wiggle = () => {
            el.classList.add('zig');
            setTimeout(() => el.classList.remove('zig'), 600);
        };
        const id = setInterval(wiggle, 3000); // every ~3s
        return () => clearInterval(id);
    }, [visible]);

    // Auto-hide after 30 seconds once visible
    useEffect(() => {
        if (!visible) return;
        const hideId = setTimeout(() => setVisible(false), 30000);
        return () => clearTimeout(hideId);
    }, [visible]);

    // If user manually changes to Hindi (or non-English), hide immediately
    useEffect(() => {
        if (i18n.language !== 'en' && visible) {
            setVisible(false);
        }
    }, [i18n.language, visible]);

    if (!visible) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div ref={boxRef} className="bg-white/95 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl px-4 py-3 flex items-center gap-3 animate-[nudgeIntro_300ms_ease-out]">
                <span className="text-sm text-gray-800 dark:text-gray-100">
                    You can also read this in Hindi.
                </span>
                <button
                    className="text-xs px-3 py-1 rounded-full bg-violet-600 text-white hover:bg-violet-700"
                    onClick={() => { i18n.changeLanguage('hi'); localStorage.setItem('lang', 'hi'); setVisible(false); }}
                >
                    Switch to Hindi
                </button>
                <button
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
                    onClick={() => { setVisible(false); localStorage.setItem('lang_nudge_dismissed_at', String(Date.now())); }}
                    aria-label="Dismiss"
                >
                    ✕
                </button>
            </div>
            <style>{`
                @keyframes nudgeIntro { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes zigzag { 0%{ transform: translate(0,0) rotate(0deg); }
                  20%{ transform: translate(-6px,-2px) rotate(-1deg); }
                  40%{ transform: translate(6px,2px) rotate(1deg); }
                  60%{ transform: translate(-5px,-1px) rotate(-0.8deg); }
                  80%{ transform: translate(5px,1px) rotate(0.8deg); }
                  100%{ transform: translate(0,0) rotate(0deg); } }
                .zig { animation: zigzag 0.6s ease-in-out; }
            `}</style>
        </div>
    );
};

export default LanguageNudge;


