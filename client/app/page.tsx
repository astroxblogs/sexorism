import NextDynamic from 'next/dynamic';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { cookies } from 'next/headers';

const Home = NextDynamic(() => import('./components/HomePage.js'), {
  ssr: false,
  loading: () => <div className="text-center py-20">Loading...</div>,
});
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title:
    'Inner Vibes  - Technology, Travel, Health, Lifestyle, Trends, Sports, Fashion with Vastu & Astro - innvibs.com',
  description:
    ' Discover the world of Lifestyle, Fashion, Travel, Sports, Technology, Astrology, and Vastu Shastra at Innvibs — your trusted destination for daily inspiration, trending ideas, and expert insights. Explore fashion trends, travel guides, health and fitness tips, tech innovations, spiritual wisdom, and vastu-based home solutions. Stay updated, stay inspired — Inner Vibes: Explore Inside, Express Outside.',
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  (process.env.NODE_ENV !== 'production' ? 'https://api.innvibs.in' : '');

function currentLang(): 'en' | 'hi' {
  const c = cookies();
  const v = c.get('i18next')?.value || c.get('NEXT_LOCALE')?.value || '';
  return v.toLowerCase().startsWith('hi') ? 'hi' : 'en';
}

async function fetchJson(url: string, lang: 'en' | 'hi') {
  try {
    const res = await fetch(url, {
      headers: { 'Accept-Language': lang },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data?.payload?.data ?? data?.data ?? data) as any;
  } catch {
    return null;
  }
}

function excerptFromHtml(html: string, len = 160) {
  const text = (html || '').replace(/<[^>]*>/g, '');
  return text.length > len ? text.slice(0, len) + '…' : text;
}

export default async function HomePage() {
  // --- SSR shell data (small, for crawlers / JS-off only) ---
  const lang = currentLang();
  const list =
    (await fetchJson(`${API_BASE}/api/blogs?limit=10&lang=${lang}`, lang)) || [];
  const posts: any[] = Array.isArray(list?.blogs) ? list.blogs : Array.isArray(list) ? list : [];

  return (
    <>
      {/* Visible only when JS is disabled; does NOT change your UI */}
      <noscript>
        <section>
          <h1>Innvibs — Latest Posts</h1>
          {posts.slice(0, 10).map((p) => (
            <article key={p._id || p.slug}>
              <h2>{p?.title}</h2>
              {p?.image ? <img src={p.image} alt={p.title} /> : null}
              <p>{excerptFromHtml(p?.content || p?.excerpt || '')}</p>
            </article>
          ))}
        </section>
      </noscript>

      {/* Your existing client UI remains exactly the same */}
      <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
        <Home />
      </Suspense>
    </>
  );
}
