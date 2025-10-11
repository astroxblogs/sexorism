// app/category/[categoryName]/page.tsx
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import NextDynamic from 'next/dynamic';

// Ensure per-request rendering
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
  ssr: false,
  loading: () => <div className="text-center py-20">Loading category…</div>,
});

function currentLang(): 'en' | 'hi' {
  const c = cookies();
  const v = c.get('i18next')?.value || c.get('NEXT_LOCALE')?.value || '';
  return v.toLowerCase().startsWith('hi') ? 'hi' : 'en';
}

async function fetchJson(url: string, lang: 'en' | 'hi') {
  const res = await fetch(url, { headers: { 'Accept-Language': lang }, cache: 'no-store' });
  if (!res.ok) return null;
  const data = await res.json();
  return (data?.payload?.data ?? data?.data ?? data) as any;
}

async function fetchCategory(slug: string, lang: 'en' | 'hi'): Promise<CategoryDto | null> {
  const candidates = Array.from(new Set([slug, slug.replace(/-and-/g, '-&-')]));

  // Try /categories/:slug first
  for (const s of candidates) {
    const bySlug = await fetchJson(`${API_BASE}/api/categories/${encodeURIComponent(s)}?lang=${lang}`, lang);
    if (bySlug) return bySlug as CategoryDto;
  }

  // Fallback: list & match
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

  if (cat && cat._id) {
    const hydrated = await fetchJson(`${API_BASE}/api/categories/${cat._id}?lang=${lang}`, lang);
    if (hydrated) cat = hydrated as CategoryDto;
  }
  return cat;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const slug = decodeURIComponent(params.categoryName);
  const lang = currentLang();
  const cat = await fetchCategory(slug, lang);

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
    openGraph: { title, description, url, type: 'website', siteName: 'Innvibs' },
    twitter: { card: 'summary_large_image', title, description },
    alternates: { canonical: url },
  };
}

function excerptFromHtml(html: string, len = 160) {
  const text = (html || '').replace(/<[^>]*>/g, '');
  return text.length > len ? text.slice(0, len) + '…' : text;
}

export default async function CategoryPageRoute({ params }: CategoryPageProps) {
  const categoryName = decodeURIComponent(params.categoryName);
  const lang = currentLang();

  // --- SSR shell (JS-off only) ---
  const list =
    (await fetchJson(
      `${API_BASE}/api/blogs?category=${encodeURIComponent(
        categoryName.replace(/-and-/g, '-&-')
      )}&limit=10&lang=${lang}`,
      lang
    )) || [];
  const posts: any[] = Array.isArray(list?.blogs) ? list.blogs : Array.isArray(list) ? list : [];

  return (
    <>
      <noscript>
        <section>
          <h1>Category: {categoryName}</h1>
          {posts.slice(0, 10).map((p) => (
            <article key={p._id || p.slug}>
              <h2>{p?.title}</h2>
              {p?.image ? <img src={p.image} alt={p.title} /> : null}
              <p>{excerptFromHtml(p?.content || p?.excerpt || '')}</p>
            </article>
          ))}
        </section>
      </noscript>

      {/* Your existing client Category UI, unchanged */}
      <CategoryPage categoryName={categoryName} />
    </>
  );
}
