// app/hi/page.tsx
import NextDynamic from 'next/dynamic';
import type { Metadata } from 'next';
import { Suspense } from 'react';

const Home = NextDynamic(() => import('../components/HomePage.js'), {
  ssr: false,
  loading: () => <div className="text-center py-20">Loading...</div>,
});

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ✅ Hindi metadata for the /hi homepage (SSR)
export const metadata: Metadata = {
  title:
    'इनर वाइब्स — टेक्नोलॉजी, ट्रैवल, हेल्थ, लाइफस्टाइल, ट्रेंड्स, स्पोर्ट्स, फैशन, वास्तु व ज्योतिष - innvibs.com',
  description:
    'लाइफस्टाइल, फैशन, ट्रैवल, स्पोर्ट्स, टेक्नोलॉजी, ज्योतिष और वास्तु शास्त्र की बेहतरीन जानकारियाँ — Innvibs पर रोज़ाना प्रेरक कंटेंट, ट्रेंडिंग आइडियाज और एक्सपर्ट इनसाइट्स। फैशन ट्रेंड्स, ट्रैवल गाइड्स, हेल्थ टिप्स, टेक इनोवेशन्स, अध्यात्म और वास्तु आधारित होम सॉल्यूशन्स पढ़ें।',
  openGraph: {
    title:
      'इनर वाइब्स — टेक्नोलॉजी, ट्रैवल, हेल्थ, लाइफस्टाइल, ट्रेंड्स, स्पोर्ट्स, फैशन, वास्तु व ज्योतिष - innvibs.com',
    description:
      'लाइफस्टाइल, फैशन, ट्रैवल, स्पोर्ट्स, टेक्नोलॉजी, ज्योतिष और वास्तु शास्त्र की बेहतरीन जानकारियाँ — Innvibs पर रोज़ाना प्रेरक कंटेंट, ट्रेंडिंग आइडियाज और एक्सपर्ट इनसाइट्स।',
    url: '/hi',
    siteName: 'Innvibs Blog',
    images: [{ url: '/top.png', width: 1200, height: 630, alt: 'Innvibs Blog' }],
    locale: 'hi_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'इनर वाइब्स — टेक्नोलॉजी, ट्रैवल, हेल्थ, लाइफस्टाइल, ट्रेंड्स, स्पोर्ट्स, फैशन, वास्तु व ज्योतिष - innvibs.com',
    description:
      'Innvibs पर रोज़ाना प्रेरक कंटेंट, ट्रेंडिंग आइडियाज और एक्सपर्ट इनसाइट्स — लाइफस्टाइल, फैशन, ट्रैवल, हेल्थ, टेक्नोलॉजी, ज्योतिष व वास्तु।',
    images: ['/top.png'],
    creator: '@innvibs',
  },
  alternates: {
    canonical: '/hi',
    languages: {
      en: '/',
      hi: '/hi',
    },
  },
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  (process.env.NODE_ENV !== 'production' ? 'https://api.innvibs.in' : '');

function excerptFromHtml(html: string, len = 160) {
  const text = (html || '').replace(/<[^>]*>/g, '');
  return text.length > len ? text.slice(0, len) + '…' : text;
}

async function fetchJson(url: string) {
  try {
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'hi' },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data?.payload?.data ?? data?.data ?? data) as any;
  } catch {
    return null;
  }
}

export default async function HomeHiPage() {
  // --- SSR shell data (for crawlers / JS-off only) ---
  const list = (await fetchJson(`${API_BASE}/api/blogs?limit=10&lang=hi`)) || [];
  const posts: any[] = Array.isArray(list?.blogs) ? list.blogs : Array.isArray(list) ? list : [];

  return (
    <>
      {/* Visible only when JS is disabled; does NOT change your UI */}
      <noscript>
        <section>
          <h1>Innvibs — नवीनतम पोस्ट</h1>
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
