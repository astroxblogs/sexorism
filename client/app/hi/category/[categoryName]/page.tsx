import type { Metadata } from 'next';
import { headers } from 'next/headers';
import NextDynamic from 'next/dynamic';

export const dynamic = 'force-dynamic';

interface LangCategoryPageProps {
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

const CategoryPage = NextDynamic(
  () => import('../../../components/CategoryPage'),
  {
    ssr: false,
    loading: () => <div className="text-center py-20">Loading category…</div>,
  }
);

async function fetchJson(url: string) {
  const res = await fetch(url, { headers: { 'Accept-Language': 'hi' }, cache: 'no-store' });
  if (!res.ok) return null;
  const data = await res.json();
  return (data?.payload?.data ?? data?.data ?? data) as any;
}

async function fetchCategory(slug: string): Promise<CategoryDto | null> {
  const candidates = Array.from(new Set([slug, slug.replace(/-and-/g, '-&-')]));

  for (const s of candidates) {
    const bySlug = await fetchJson(`${API_BASE}/api/categories/${encodeURIComponent(s)}?lang=hi`);
    if (bySlug) return bySlug as CategoryDto;
  }

  const list = await fetchJson(`${API_BASE}/api/categories?lang=hi`);
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
    items.find((c) => norm(c.name_hi) === norm(nameFromCleanSlug)) ||
    items.find((c) => norm(c.name_en) === norm(nameFromCleanSlug)) ||
    null;

  if (cat && cat._id) {
    const hydrated = await fetchJson(`${API_BASE}/api/categories/${cat._id}?lang=hi`);
    if (hydrated) cat = hydrated as CategoryDto;
  }
  return cat;
}

export async function generateMetadata({ params }: LangCategoryPageProps): Promise<Metadata> {
  const slug = decodeURIComponent(params.categoryName);
  const cat = await fetchCategory(slug);

  const title =
    cat?.seo?.metaTitle ??
    cat?.metaTitle ??
    cat?.metaTitle_hi ??
    undefined;

  const description =
    cat?.seo?.metaDescription ??
    cat?.metaDescription ??
    cat?.metaDescription_hi ??
    undefined;

  const host = headers().get('host') || 'www.innvibs.in';
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || `https://${host}`).replace(/\/$/, '');

  const urlCurrent = `${siteUrl}/hi/${slug}`;
  const urlEn = `${siteUrl}/${slug}`;
  const urlHi = `${siteUrl}/hi/${slug}`;

  return {
    title,
    description,
    openGraph: { title, description, url: urlCurrent, type: 'website', siteName: 'Innvibs' },
    twitter: { card: 'summary_large_image', title, description },
    alternates: { canonical: urlCurrent, languages: { en: urlEn, hi: urlHi } },
  };
}

export default function CategoryHiPage({ params }: LangCategoryPageProps) {
  const categoryName = decodeURIComponent(params.categoryName);
  return <CategoryPage categoryName={categoryName} />;
}
