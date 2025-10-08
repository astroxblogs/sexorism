import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
 import { setApiLanguage } from '../lib/api';


const LanguageNudge = () => {
    const { i18n } = useTranslation();
    const [visible, setVisible] = useState(false);
    const boxRef = useRef(null);

    // Determine if the nudge should be active and what it should display
    const currentLang = i18n?.resolvedLanguage || i18n?.language || 'en';
    const isNudgeActiveForLang = currentLang === 'en' || currentLang === 'hi';
    const targetLang = currentLang === 'en' ? 'hi' : 'en';
    const nudgeText = currentLang === 'en' ? 'Read in Hindi' : 'Read in English';

    useEffect(() => {
        // Only show the nudge if the current language is English or Hindi
        if (!isNudgeActiveForLang) {
            setVisible(false); // Hide if language changes to something else
            return;
        }

        const lastDismiss = localStorage.getItem('lang_nudge_dismissed_at');
        const now = Date.now();
        // Check if the user has dismissed the nudge in the last 2 hours
        if (lastDismiss && now - Number(lastDismiss) < 2 * 60 * 60 * 1000) return;
        
        // Show the nudge after a delay
        const t = setTimeout(() => setVisible(true), 2500);
        return () => clearTimeout(t);
    }, [currentLang, isNudgeActiveForLang]);

    useEffect(() => {
        if (!visible) return;
        const el = boxRef.current;
        if (!el) return;
        // Wiggle animation interval
        const wiggle = () => {
            el.classList.add('zig');
            setTimeout(() => el.classList.remove('zig'), 600);
        };
        const id = setInterval(wiggle, 3000);
        return () => clearInterval(id);
    }, [visible]);

    useEffect(() => {
        if (!visible) return;
        // Automatically hide the nudge after 15 seconds
        const hideId = setTimeout(() => setVisible(false), 15000);
        return () => clearTimeout(hideId);
    }, [visible]);

    if (!visible) return null;

    const router = useRouter();
const handleSwitchLanguage = async () => {
  await i18n.changeLanguage(targetLang);
  setApiLanguage(targetLang);          // keep axios in sync (adds ?lang + header)
  localStorage.setItem('lang', targetLang);
  setVisible(false);
  router.refresh();                    // triggers data re-fetch (sidebar rebuild)
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
  className="relative w-max flex items-center gap-1 rounded-full bg-violet-600 hover:bg-violet-700 transition-colors shadow-lg cursor-pointer animate-[nudgeIntro_300ms_ease-out]"
  onClick={handleSwitchLanguage}
>
  <span className="text-sm font-medium text-white pl-3 pr-2 py-1">
    {nudgeText}
  </span>
  <button
    className="w-5 h-5 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
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
