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

export async function generateMetadata(): Promise<Metadata> {
  const lang = currentLang();
  const isHi = lang === 'hi';

  const title_en = 
    'Sexorism — Erotic Sex Stories, Adult Blogs & Bold Pleasure | 18+ Only';
  const desc_en =
    'Dive into Sexorism: Your ultimate 18+ adult destination for steamy erotic stories, real confessions, adult blogs, and fantasies. Dare to explore desire and pleasure like never before.';

  const title_hi =
    'Sexorism — एडल्ट सेक्स स्टोरी, बोल्ड ब्लॉग, और यौन संतुष्टि | केवल 18+ के लिए';
  const desc_hi =
    'Sexorism पर पाएं इरोटिक कहानियाँ, सच्चे अनुभव और वयस्क ब्लॉग। सिर्फ 18+ के लिए, जहाँ इच्छा और आनंद है।';

  const title = isHi ? title_hi : title_en;
  const description = isHi ? desc_hi : desc_en;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: isHi ? '/hi' : '/',
      siteName: 'Sexorism',
      images: [{ url: '/light.png', width: 1200, height: 630, alt: 'Sexorism — Erotic Adult Content' }],
      locale: isHi ? 'hi_IN' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/light.png'],
      creator: '@sexorism',
    },
    alternates: {
      canonical: isHi ? '/hi' : '/',
      languages: { en: '/', hi: '/hi' },
    },
  };
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  (process.env.NODE_ENV !== 'production' ? 'https://api.sexorism.com' : '');

function currentLang(): 'en' | 'hi' {
  const c = cookies();
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
  const lang = currentLang();
  const list =
    (await fetchJson(`${API_BASE}/api/blogs?limit=10&lang=${lang}`, lang)) || [];
  const posts: any[] = Array.isArray(list?.blogs) ? list.blogs : Array.isArray(list) ? list : [];

  return (
    <>
      <noscript>
        <section>
          <h1>Sexorism — Latest 18+ Adult Posts</h1>
          {posts.slice(0, 10).map((p) => (
            <article key={p._id || p.slug}>
              <h2>{p?.title}</h2>
              {p?.image ? <img src={p.image} alt={p.title} /> : null}
              <p>{excerptFromHtml(p?.content || p?.excerpt || '')}</p>
            </article>
          ))}
        </section>
      </noscript>

      <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
        <Home key={`home-${lang}`} />
      </Suspense>
    </>
  );
}
