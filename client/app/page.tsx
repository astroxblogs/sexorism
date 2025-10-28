import NextDynamic from 'next/dynamic';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { cookies } from 'next/headers';
//  import AdSense from './components/AdSense'; // ✅ AD: domain-aware

const Home = NextDynamic(() => import('./components/HomePage.js'), {
  ssr: false,
  loading: () => <div className="text-center py-20">Loading...</div>,
});
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ⛏️ replace this:
// export const metadata: Metadata = { ... }

// ✅ with this:
export async function generateMetadata(): Promise<Metadata> {
  const lang = currentLang(); // reads NEXT_LOCALE/i18next cookie
  const isHi = lang === 'hi';

  const title_en =
    'Inner Vibes  - Technology, Travel, Health, Lifestyle, Trends, Sports, Fashion with Vastu & Astro - innvibs.com';
  const desc_en =
    ' Discover the world of Lifestyle, Fashion, Travel, Sports, Technology, Astrology, and Vastu Shastra at Innvibs — your trusted destination for daily inspiration, trending ideas, and expert insights. Explore fashion trends, travel guides, health and fitness tips, tech innovations, spiritual wisdom, and vastu-based home solutions. Stay updated, stay inspired — Inner Vibes: Explore Inside, Express Outside.';

  const title_hi =
    'Inner vibes— टेक्नोलॉजी, ट्रैवल, हेल्थ, लाइफस्टाइल, ट्रेंड्स, स्पोर्ट्स, फैशन, वास्तु व ज्योतिष - innvibs.com';
  const desc_hi =
    'लाइफस्टाइल, फैशन, ट्रैवल, स्पोर्ट्स, टेक्नोलॉजी, ज्योतिष और वास्तु शास्त्र पर रोज़ाना प्रेरक कंटेंट, ट्रेंडिंग आइडियाज़ और विशेषज्ञ इनसाइट्स — Innvibs पर पढ़ें।';

  const title = isHi ? title_hi : title_en;
  const description = isHi ? desc_hi : desc_en;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: isHi ? '/hi' : '/',
      siteName: 'Innvibs Blog',
      images: [{ url: '/top.png', width: 1200, height: 630, alt: 'Innvibs Blog' }],
      locale: isHi ? 'hi_IN' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/top.png'],
      creator: '@innvibs',
    },
    alternates: {
      canonical: isHi ? '/hi' : '/',
      languages: { en: '/', hi: '/hi' },
    },
  };
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  (process.env.NODE_ENV !== 'production' ? 'https://api.innvibs.in' : '');

function currentLang(): 'en' | 'hi' {
  const c = cookies();
   // Prefer middleware-set cookie; fall back to i18next
  const v = c.get('NEXT_LOCALE')?.value || c.get('i18next')?.value || '';
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

     {/* AD SLOT: Home Top Leaderboard (below header, above feed) */}
      {/* <div className="mx-auto max-w-screen-xl px-3 my-3 empty:hidden">
       <AdSense slot="home_top_leaderboard" className="ad-slot ad-slot--leaderboard w-full" />
     </div> */}

      {/* Your existing client UI remains exactly the same */}
      <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
        <Home key={`home-${lang}`} />
      </Suspense>

     {/* AD SLOT: Home Bottom Leaderboard (after feed) */}
    {/* <div className="mx-auto max-w-screen-xl px-3 my-6 empty:hidden">
       <AdSense slot="home_bottom_leaderboard" className="ad-slot ad-slot--leaderboard w-full" />
     </div> */}
    </>
  );
}
