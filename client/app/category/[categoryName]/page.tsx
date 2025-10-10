// app/category/[categoryName]/page.tsx
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import NextDynamic from 'next/dynamic'

// Make metadata run per-request
export const dynamic = 'force-dynamic'

interface CategoryPageProps {
  params: { categoryName: string }
}

type CategoryDto = {
  slug?: string
  name?: string
  name_en?: string
  name_hi?: string
  metaTitle?: string
  metaDescription?: string
  metaTitle_en?: string
  metaTitle_hi?: string
  metaDescription_en?: string
  metaDescription_hi?: string
  seo?: { metaTitle?: string; metaDescription?: string }
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || ''

const CategoryPage = NextDynamic(() => import('../../components/CategoryPage'), {
  ssr: false,
  loading: () => <div className="text-center py-20">Loading category…</div>,
})

function currentLang(): 'en' | 'hi' {
  const c = cookies()
  const v = c.get('i18next')?.value || c.get('NEXT_LOCALE')?.value || ''
  return v.toLowerCase().startsWith('hi') ? 'hi' : 'en'
}

async function fetchJson(url: string, lang: 'en' | 'hi') {
  const res = await fetch(url, {
    headers: { 'Accept-Language': lang },
    cache: 'no-store',
  })
  if (!res.ok) return null
  const data = await res.json()
  return (data?.payload?.data ?? data?.data ?? data) as any
}

/**
 * Match the *same* lookup your client uses:
 * 1) try /categories/:slug (and :slug with "-&-" variant)
 * 2) fallback: GET /categories and find by slug or name
 */
async function fetchCategory(slug: string, lang: 'en' | 'hi'): Promise<CategoryDto | null> {
  const candidates = Array.from(new Set([
    slug,
    slug.replace(/-and-/g, '-&-'),
  ]))

  // 1) try direct endpoints first
  for (const s of candidates) {
    const url = `${API_BASE}/api/categories/${encodeURIComponent(s)}?lang=${lang}`
    const cat = await fetchJson(url, lang)
    if (cat) return cat
  }

  // 2) fallback to list and find
  const list = await fetchJson(`${API_BASE}/api/categories?lang=${lang}`, lang)
  const items: CategoryDto[] = Array.isArray(list) ? list : (list?.categories || [])
  const norm = (x: any) => String(x ?? '').trim().toLowerCase()

  const nameFromCleanSlug = slug
    .replace(/-and-/g, ' & ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return (
    items.find(c => norm(c.slug) === norm(slug)) ||
    items.find(c => norm(c.slug) === norm(slug.replace(/-and-/g, '-&-'))) ||
    items.find(c => norm(c.name_en) === norm(nameFromCleanSlug)) ||
    items.find(c => norm(c.name_hi) === norm(nameFromCleanSlug)) ||
    null
  )
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const slug = decodeURIComponent(params.categoryName)
  const lang = currentLang()
  const cat = await fetchCategory(slug, lang)

  const fallbackTitle = lang === 'hi' ? 'श्रेणी' : 'Category'
  const name = (lang === 'hi' ? cat?.name_hi : cat?.name_en) || cat?.name || slug

  // Prefer localized single-field, then suffixed, then fallbacks
  const title =
    cat?.seo?.metaTitle ||
    cat?.metaTitle ||
    (lang === 'hi' ? cat?.metaTitle_hi : cat?.metaTitle_en) ||
    `${name} Blogs - Innvibs`

  const description =
    cat?.seo?.metaDescription ||
    cat?.metaDescription ||
    (lang === 'hi' ? cat?.metaDescription_hi : cat?.metaDescription_en) ||
    (lang === 'hi'
      ? `${name} श्रेणी के ताज़ा लेख पढ़ें।`
      : `Explore the latest ${name} articles on Innvibs.`)

  const url = `/${slug}` // clean canonical to root form

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
  }
}

export default function CategoryPageRoute({ params }: CategoryPageProps) {
  const categoryName = decodeURIComponent(params.categoryName)
  return <CategoryPage categoryName={categoryName} />
}
