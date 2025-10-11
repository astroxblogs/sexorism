// app/about/layout.tsx
import type { Metadata } from 'next';
import Script from 'next/script';
import { getBaseUrl } from '../lib/site';

const BASE_URL = getBaseUrl();
export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'About Us - Innvibs',
  description:
    'Learn more about Innvibs—our mission, values, and the topics we cover across lifestyle, fashion, technology, travel, sports, astrology, and Vastu Shastra.',
  keywords: [
    'about Innvibs',
    'our mission',
    'Innvibs values',
    'lifestyle blog',
    'fashion technology travel sports astrology vastu',
  ],
  authors: [{ name: 'Innvibs' }],
  creator: 'Astrox Softech Pvt Ltd',
  publisher: 'Innvibs',
  formatDetection: { email: false, address: false, telephone: false },

  // Dynamic base: switches between .com (prod) and .in (preview/dev)
  metadataBase: new URL(BASE_URL),

  alternates: { canonical: '/about' },

  openGraph: {
    title: 'About Us - Innvibs',
    description:
      'Discover Innvibs: our mission, values, and what we offer across lifestyle, fashion, technology, travel, sports, astrology, and Vastu Shastra.',
    url: '/about',
    siteName: 'Innvibs',
    images: [{ url: '/top.png', width: 1200, height: 630, alt: 'Innvibs About' }],
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'About Us - Innvibs',
    description:
      'Discover Innvibs: our mission, values, and what we offer across lifestyle, fashion, technology, travel, sports, astrology, and Vastu Shastra.',
    images: ['/top.png'],
    creator: '@innvibs',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'About Us - Innvibs',
    url: `${BASE_URL}/about`,
    isPartOf: { '@type': 'WebSite', name: 'Innvibs', url: BASE_URL },
    about: {
      '@type': 'Organization',
      name: 'Innvibs',
      parentOrganization: { '@type': 'Organization', name: 'Astrox Softech Pvt Ltd' },
      url: BASE_URL,
      logo: `${BASE_URL}/top.png`,
      sameAs: ['https://www.facebook.com/innvibs'],
    },
  };

  return (
    <>
      <Script
        id="about-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
