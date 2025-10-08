// app/privacy/layout.tsx
import type { Metadata } from 'next';
import Script from 'next/script';
import { getBaseUrl } from '../lib/site'; // <= see lib/site.ts below

const BASE_URL = getBaseUrl();

export const metadata: Metadata = {
  title: 'Privacy Policy - Innvibs',
  description:
    'Read our privacy policy and understand how we collect, use, and protect your data at Innvibs.',
  keywords: [
    'privacy policy',
    'data protection',
    'cookie policy',
    'personal data',
    'Innvibs privacy',
  ],
  authors: [{ name: 'Innvibs Team' }],
  creator: 'Astrox Softech Pvt Ltd',
  publisher: 'Innvibs',
  formatDetection: { email: false, address: false, telephone: false },

  // Dynamic base so canonical/OG resolve correctly on .com (prod) and .in (dev)
  metadataBase: new URL(BASE_URL),

  alternates: { canonical: '/privacy' },

  openGraph: {
    title: 'Privacy Policy - Innvibs',
    description:
      'Understand how Innvibs collects, uses, shares, and protects your personal information.',
    url: '/privacy',            // resolves against metadataBase
    siteName: 'Innvibs',
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'Innvibs Privacy Policy' }],
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy - Innvibs',
    description:
      'Understand how Innvibs collects, uses, shares, and protects your personal information.',
    images: ['/logo.png'],
    creator: '@innvibs',
  },

  // Let robots settings inherit from root layout (recommended).
  // If you prefer explicit robots here, you can copy the root logic in.
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Privacy Policy - Innvibs',
    url: `${BASE_URL}/privacy`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Innvibs',
      url: BASE_URL,
    },
    about: {
      '@type': 'Organization',
      name: 'Innvibs',
      parentOrganization: { '@type': 'Organization', name: 'Astrox Softech Pvt Ltd' },
      url: BASE_URL,
      logo: `${BASE_URL}/logo.png`,
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
        id="privacy-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
