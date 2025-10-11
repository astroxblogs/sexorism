// app/terms/layout.tsx
import type { Metadata } from 'next';
import Script from 'next/script';
import { getBaseUrl } from '../lib/site'; // <= make sure lib/site.ts exists (as shared earlier)

const BASE_URL = getBaseUrl();
export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Terms of Service - Innvibs',
  description:
    'Read the Innvibs Terms of Service and user agreement, including acceptable use, IP rights, limitations, and governing law.',
  // Dynamic base so canonical / OG resolve for both .com (prod) and .in (dev)
  metadataBase: new URL(BASE_URL),
  alternates: { canonical: '/terms' },
  openGraph: {
    title: 'Terms of Service - Innvibs',
    description:
      'Understand the rules for using Innvibs: acceptable use, IP rights, liability limits, and governing law.',
    url: '/terms', // resolves against metadataBase
    siteName: 'Innvibs',
    images: [{ url: '/top.png', width: 1200, height: 630, alt: 'Innvibs Terms of Service' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service - Innvibs',
    description:
      'Understand the rules for using Innvibs: acceptable use, IP rights, liability limits, and governing law.',
    images: ['/top.png'],
    creator: '@innvibs',
  },
  // You can let robots inherit from root; keeping your explicit config is fine too:
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Terms of Service - Innvibs',
    url: `${BASE_URL}/terms`,
    isPartOf: { '@type': 'WebSite', name: 'Innvibs', url: BASE_URL },
    about: {
      '@type': 'Organization',
      name: 'Innvibs',
      parentOrganization: { '@type': 'Organization', name: 'Astrox Softech Pvt Ltd' },
      url: BASE_URL,
      logo: `${BASE_URL}/top.png`,
      sameAs: ['https://www.facebook.com/innvibs'],
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          email: 'contact@astroxsoftech.com',
          availableLanguage: ['en', 'hi'],
          areaServed: 'IN',
        },
      ],
    },
    datePublished: '2025-09-23',
    dateModified: '2025-09-23',
  };

  return (
    <>
      <Script
        id="terms-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
