// app/category/[categoryName]/page.tsx
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import NextDynamic from 'next/dynamic';
import Link from 'next/link';

// Ensure per-request metadata generation
export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: { categoryName: string };
}

type CategoryDto = {
  _id?: string;
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
  // allow SSR so initial HTML is present for crawlers
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
    const hydrated = await fetchJson(`${API_BASE}/api/categories/${cat._id}?lang=${lang}`, lang);
    if (hydrated) cat = hydrated as CategoryDto;
  }

  return cat;
}

// --- helpers for the server-rendered list ---
function stripHtml(html: string): string {
  return (html || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function excerptOf(blog: any, n = 160): string {
  const raw =
    blog?.excerpt ||
    blog?.summary ||
    stripHtml(blog?.content || blog?.html || '');
  return raw.length > n ? raw.slice(0, n) + '…' : raw;
}

function canonicalPath(catSlug: string | undefined, blogSlug: string | undefined): string {
  if (!catSlug || !blogSlug) return '#';
  return `/${encodeURIComponent(catSlug)}/${encodeURIComponent(blogSlug)}`;
}

async function fetchCategoryBlogs(catForQuery: string, lang: 'en' | 'hi') {
  // Map "And" to "&" if your API expects the ampersand form
  const queryCategory = catForQuery.replace(/\bAnd\b/gi, '&');
  const url = `${API_BASE}/api/blogs?category=${encodeURIComponent(queryCategory)}&page=1&limit=10&lang=${lang}`;
  const res = await fetch(url, { cache: 'no-store', headers: { 'Accept-Language': lang } });
  if (!res.ok) return [];
  const json = await res.json();
  const blogs = json?.blogs ?? json?.data ?? json?.payload?.data ?? json;
  return Array.isArray(blogs) ? blogs : [];
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
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

export default async function CategoryPageRoute({ params }: CategoryPageProps) {
  const categoryName = decodeURIComponent(params.categoryName);
  const lang = currentLang();
  const category = await fetchCategory(categoryName, lang);
  const isHi = lang === 'hi';

  if (!category) {
    return <div className="container mx-auto p-6 text-center">Category not found.</div>;
  }

  // Prefer explicit cat slug/name for API query; fall back to slug/param
  const catForQuery =
    category.name_en ||
    category.name ||
    category.slug ||
    categoryName;

  const posts = await fetchCategoryBlogs(catForQuery, lang);
  const first = posts.slice(0, 10);

  return (
    <>
      {/* 1) Server-rendered HTML list for crawlers/AdSense */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <section aria-labelledby="cat-heading" className="mb-10">
          <h1 id="cat-heading" className="sr-only">
            {category?.name_en || category?.name || categoryName}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {first.map((b: any, idx: number) => {
              const href = canonicalPath(category.slug, b?.slug || b?.blogSlug);
              const title = b?.title || 'Untitled';
              const img = b?.image || b?.coverImage || null;
              const alt = title;
              const text = excerptOf(b);

              return (
                <article
                  key={b?._id || b?.id || `${href}-${idx}`}
                  className="border border-gray-200/60 dark:border-gray-700/60 rounded-lg p-4 bg-white dark:bg-gray-900"
                >
                  {img ? (
                    <div className="mb-3">
                      {/* Do not lazy-load the very first image for better LCP */}
                      <img
                        src={img}
                        alt={alt}
                        width={1200}
                        height={630}
                        {...(idx > 0 ? { loading: 'lazy' } : {})}
                        className="w-full h-auto rounded-md"
                      />
                    </div>
                  ) : null}

                  <h2 className="text-lg font-semibold mb-2">
                    <Link href={href} prefetch>
                      {title}
                    </Link>
                  </h2>

                  {text ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>
      </main>

      {/* 2) Existing interactive client widget */}
      <CategoryPage category={category} isHi={isHi} />
    </>
  );
}
