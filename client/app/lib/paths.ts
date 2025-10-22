// Locale-aware path helpers (tiny, focused, no UI impact)

export type Locale = 'en' | 'hi';

export const LOCALES = new Set<Locale>(['en', 'hi']);

/** Is the first segment a locale marker? */
export function isLocaleSegment(seg?: string): seg is Locale {
  if (!seg) return false;
  const s = seg.toLowerCase();
  return s === 'en' || s === 'hi';
}

/** Pull active locale from a pathname like "/hi/tech" → "hi"; defaults to "en". */
export function getLocaleFromPath(pathname: string): Locale {
  try {
    const seg = (pathname || '/').split('?')[0].split('/').filter(Boolean)[0] || '';
    return isLocaleSegment(seg) && seg !== 'en' ? 'hi' : 'en';
  } catch {
    return 'en';
  }
}

/** Build a path with the given locale and segments. Normalizes slashes. */
export function buildLocalePath(locale: Locale, ...segments: Array<string | undefined | null>): string {
  const loc = locale === 'hi' ? 'hi' : 'en';
  const clean = segments
    .filter(Boolean)
    .map(s => String(s).trim().replace(/^\/+|\/+$/g, ''))
    .filter(s => s.length > 0);

  // For "en" we keep root clean (no /en prefix). For "hi" we prefix with /hi.
  const head = loc === 'hi' ? ['hi', ...clean] : clean;
  return '/' + head.join('/');
}

/** Category page path: "/tech" or "/hi/tech" */
export function makeCategoryLink(locale: Locale, categorySlug: string): string {
  return buildLocalePath(locale, categorySlug);
}

/** Blog detail path: "/tech/my-post" or "/hi/tech/my-post" */
export function makeBlogLink(locale: Locale, categorySlug: string, blogSlug: string): string {
  return buildLocalePath(locale, categorySlug, blogSlug);
}
