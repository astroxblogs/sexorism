// app/category/[categoryName]/page.tsx
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import NextDynamic from 'next/dynamic';

// Ensure per-request metadata generation
export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: { categoryName: string };
}

type CategoryDto = {
  slug?: string;
  name?: string;
  name_en?: string;
  name_hi?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaTitle_en?: string;
  metaTitle_hi?: string;
  metaDescription_en?: string;
  metaDescription_hi?: string;
  seo?: { metaTitle?: string; metaDescription?: string };
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  (process.env.NODE_ENV !== 'production' ? 'https://api.innvibs.in' : '');

const CategoryPage = NextDynamic(() => import('../../components/CategoryPage'), {
  ssr: false,
  loading: () => <div className="text-center py-20">Loading category…</div>,
});

function currentLang(): 'en' | 'hi' {
  const c = cookies();
  const v = c.get('i18next')?.value || c.get('NEXT_LOCALE')?.value || '';
  return v.toLowerCase().startsWith('hi') ? 'hi' : 'en';
}

async function fetchJson(url: string, lang: 'en' | 'hi') {
  const res = await fetch(url, {
    headers: { 'Accept-Language': lang },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const data = await res.json();
  return (data?.payload?.data ?? data?.data ?? data) as any;
}

function hasSeoFields(cat: any): boolean {
  if (!cat || typeof cat !== 'object') return false;
  return (
    'metaTitle' in cat ||
    'metaTitle_en' in cat ||
    'metaTitle_hi' in cat ||
    'metaDescription' in cat ||
    'metaDescription_en' in cat ||
    'metaDescription_hi' in cat ||
    (cat.seo && (cat.seo.metaTitle || cat.seo.metaDescription))
  );
}

/**
 * Match the client lookup strategy:
 * 1) try /categories/by-slug/:slug (and -&- variant)
 * 2) try /categories/:slug (and -&- variant)
 * 3) fallback: GET /categories and match by slug or name
 * If fallback result lacks SEO fields, hydrate once via by-slug.
 */
async function fetchCategory(slug: string, lang: 'en' | 'hi'): Promise<CategoryDto | null> {
  const candidates = Array.from(new Set([slug, slug.replace(/-and-/g, '-&-')]));

  // 1) Try /categories/:slug first (since /by-slug is 404 on .in)
  for (const s of candidates) {
    const bySlug = await fetchJson(
      `${API_BASE}/api/categories/${encodeURIComponent(s)}?lang=${lang}`,
      lang
    );
    if (bySlug) return bySlug as CategoryDto;
  }

  // 2) Fallback to list and match
  const list = await fetchJson(`${API_BASE}/api/categories?lang=${lang}`, lang);
  const items: any[] = Array.isArray(list) ? list : list?.categories || [];
  const norm = (x: any) => String(x ?? '').trim().toLowerCase();

  const nameFromCleanSlug = slug
    .replace(/-and-/g, ' & ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  let cat =
    items.find((c) => norm(c.slug) === norm(slug)) ||
    items.find((c) => norm(c.slug) === norm(slug.replace(/-and-/g, '-&-'))) ||
    items.find((c) => norm(c.name_en) === norm(nameFromCleanSlug)) ||
    items.find((c) => norm(c.name_hi) === norm(nameFromCleanSlug)) ||
    null;

  // 3) If we matched via list, hydrate by ID to get full SEO
  if (cat && cat._id) {
    const hydrated = await fetchJson(
      `${API_BASE}/api/categories/${cat._id}?lang=${lang}`,
      lang
    );
    if (hydrated) cat = hydrated as CategoryDto;
  }

  return cat;
}


export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const slug = decodeURIComponent(params.categoryName);
  const lang = currentLang();
  const cat = await fetchCategory(slug, lang);

  // DB-only metadata (no prefixes/suffixes)
  const title =
    cat?.seo?.metaTitle ??
    cat?.metaTitle ??
    (lang === 'hi' ? cat?.metaTitle_hi : cat?.metaTitle_en) ??
    undefined;

  const description =
    cat?.seo?.metaDescription ??
    cat?.metaDescription ??
    (lang === 'hi' ? cat?.metaDescription_hi : cat?.metaDescription_en) ??
    undefined;

  const url = `/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: 'Innvibs',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: { canonical: url },
  };
}

export default function CategoryPageRoute({ params }: CategoryPageProps) {
  const categoryName = decodeURIComponent(params.categoryName);
  return <CategoryPage categoryName={categoryName} />;
}
