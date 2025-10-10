// app/category/[categoryName]/page.tsx
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import NextDynamic from 'next/dynamic';


// Ensure this route (and its metadata) is generated per-request
export const dynamic = 'force-dynamic'

interface CategoryPageProps {
  params: { categoryName: string }
}

type CategoryDto = {
  slug: string
  // Localized single-field (most APIs return these when ?lang=en/hi)
  metaTitle?: string
  metaDescription?: string
  name?: string

  // Or language-suffixed fields (if API returns all langs together)
  metaTitle_en?: string
  metaTitle_hi?: string
  metaDescription_en?: string
  metaDescription_hi?: string
  name_en?: string
  name_hi?: string

  // Some backends nest SEO
  seo?: {
    metaTitle?: string
    metaDescription?: string
  }
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || ''

// Client Category page
const CategoryPage = NextDynamic(() => import('../../components/CategoryPage'), {
  ssr: false,
  loading: () => <div className="text-center py-20">Loading category…</div>,
});


function currentLang(): 'en' | 'hi' {
  const c = cookies()
  const fromCookie =
    c.get('i18next')?.value ||
    c.get('NEXT_LOCALE')?.value ||
    ''
  return fromCookie.toLowerCase().startsWith('hi') ? 'hi' : 'en'
}

async function fetchCategory(slug: string, lang: 'en' | 'hi'): Promise<CategoryDto | null> {
  try {
    // Your API base is origin-only → keep /api/... in path
    const url = `${API_BASE}/api/categories/by-slug/${encodeURIComponent(slug)}?lang=${lang}`

    const res = await fetch(url, {
      headers: { 'Accept-Language': lang },
      // make sure we don't serve cached/fallback data in <head>
      cache: 'no-store',
    })

    if (!res.ok) return null
    const data = await res.json()
    return (data?.payload?.data ?? data?.data ?? data) as CategoryDto
  } catch {
    return null
  }
}

export async function generateMetadata(
  { params }: CategoryPageProps
): Promise<Metadata> {
  const slug = decodeURIComponent(params.categoryName)
  const lang = currentLang()
  const cat = await fetchCategory(slug, lang)

  const fallbackTitle = lang === 'hi' ? 'श्रेणी' : 'Category'

  // Prefer localized single-field, then suffixed, then name
  const title =
    cat?.seo?.metaTitle ||
    cat?.metaTitle ||
    (lang === 'hi' ? cat?.metaTitle_hi : cat?.metaTitle_en) ||
    (lang === 'hi' ? cat?.name_hi : cat?.name_en) ||
    cat?.name ||
    `${fallbackTitle}: ${slug}`

  const description =
    cat?.seo?.metaDescription ||
    cat?.metaDescription ||
    (lang === 'hi' ? cat?.metaDescription_hi : cat?.metaDescription_en) ||
    (lang === 'hi'
      ? 'इस श्रेणी के लेख पढ़ें।'
      : 'Read articles from this category.')

  const url = `/category/${slug}`

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
    alternates: {
      canonical: url,
    },
  }
}

export default function CategoryPageRoute({ params }: CategoryPageProps) {
  const categoryName = decodeURIComponent(params.categoryName)
  return <CategoryPage categoryName={categoryName} />
}
