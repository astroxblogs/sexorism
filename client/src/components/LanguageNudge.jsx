import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageNudge = () => {
    const { i18n } = useTranslation();
    const [visible, setVisible] = useState(false);
    const boxRef = useRef(null);

    useEffect(() => {
        if (i18n.language !== 'en') return;
        const lastDismiss = localStorage.getItem('lang_nudge_dismissed_at');
        const now = Date.now();
        if (lastDismiss && now - Number(lastDismiss) < 2 * 60 * 60 * 1000) return;
        const t = setTimeout(() => setVisible(true), 2500);
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
        const id = setInterval(wiggle, 3000);
        return () => clearInterval(id);
    }, [visible]);

    useEffect(() => {
        if (!visible) return;
        const hideId = setTimeout(() => setVisible(false), 15000);
        return () => clearTimeout(hideId);
    }, [visible]);

    useEffect(() => {
        if (i18n.language !== 'en' && visible) {
            setVisible(false);
        }
    }, [i18n.language, visible]);

    if (!visible) return null;

    const handleSwitchLanguage = () => {
        i18n.changeLanguage('hi');
        localStorage.setItem('lang', 'hi');
        setVisible(false);
    };

    const handleDismiss = (e) => {
        e.stopPropagation(); // Prevents the language from switching when closing
        setVisible(false);
        localStorage.setItem('lang_nudge_dismissed_at', String(Date.now()));
    };

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
            <div
                ref={boxRef}
                className="relative w-max flex items-center rounded-full bg-violet-600 hover:bg-violet-700 transition-colors shadow-lg cursor-pointer animate-[nudgeIntro_300ms_ease-out]"
                onClick={handleSwitchLanguage}
            >
                {/* ✅ CHANGE: Reduced padding for a much more compact size */}
                <span className="text-sm font-medium text-white pl-4 pr-8 py-1.5 block">
  Read in Hindi
</span>
<button
  className="absolute top-1/2 right-1 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
  onClick={handleDismiss}
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