import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter, usePathname } from 'next/navigation';
import { setApiLanguage } from '../lib/api';

const VALID_CATEGORY_SLUGS = new Set([
  'technology',
  'fashion',
  'health-wellness',
  'travel',
  'food-cooking',
  'sports',
  'business-finance',
  'lifestyle',
  'trends',
  'relationship',
  'astrology',
  'vastu-shastra',
]);

const LanguageNudge = () => {
  const { i18n } = useTranslation();
  const [visible, setVisible] = useState(false);
  const boxRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  // Route awareness: support both /{category} and /category/{category}
  const segments = (pathname || '/')
    .split('?')[0]
    .split('#')[0]
    .split('/')
    .filter(Boolean);
  const first = segments[0] || '';
  const second = segments[1] || '';
  const onCategoryPage =
    VALID_CATEGORY_SLUGS.has(first) ||
    (first === 'category' && VALID_CATEGORY_SLUGS.has(second));

  const currentLang = i18n?.resolvedLanguage || i18n?.language || 'en';
  const isNudgeActiveForLang = currentLang === 'en' || currentLang === 'hi';
  const targetLang = currentLang === 'en' ? 'hi' : 'en';
  const nudgeText = currentLang === 'en' ? 'Read in Hindi' : 'Read in English';

  useEffect(() => {
    // Only show on category pages and only for en/hi languages
    if (!onCategoryPage || !isNudgeActiveForLang) {
      setVisible(false);
      return;
    }

    const lastDismiss = localStorage.getItem('lang_nudge_dismissed_at');
    const now = Date.now();
    if (lastDismiss && now - Number(lastDismiss) < 2 * 60 * 60 * 1000) return;

    const t = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(t);
  }, [onCategoryPage, isNudgeActiveForLang, currentLang]);

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

  if (!visible) return null;

  const handleSwitchLanguage = async () => {
    await i18n.changeLanguage(targetLang);
    setApiLanguage(targetLang);
    localStorage.setItem('lang', targetLang);
    setVisible(false);
    router.refresh();
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
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
          type="button"
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
