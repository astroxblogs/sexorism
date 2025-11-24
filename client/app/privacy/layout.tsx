// app/privacy/layout.tsx
import type { Metadata } from 'next';
import Script from 'next/script';
import { getBaseUrl } from '../lib/site';

const BASE_URL = getBaseUrl();
export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Privacy Policy - Sexorism',
  description:
    'Read our privacy policy and understand how we collect, use, and protect your data at Sexorism.',
  keywords: ['privacy policy','data protection','cookie policy','personal data','Sexorism privacy'],
  authors: [{ name: 'Sexorism' }],
  creator: 'Astrox Softech Pvt Ltd',
  publisher: 'Sexorism',
  formatDetection: { email: false, address: false, telephone: false },
  metadataBase: new URL(BASE_URL),
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: 'Privacy Policy - Sexorism',
    description:
      'Understand how Sexorism collects, uses, shares, and protects your personal information.',
    url: '/privacy',
    siteName: 'Sexorism',
    images: [{ url: '/top.png', width: 1200, height: 630, alt: 'Sexorism Privacy Policy' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy - Sexorism',
    description:
      'Understand how Sexorism collects, uses, shares, and protects your personal information.',
    images: ['/top.png'],
    creator: '@Sexorism',
  },
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
    name: 'Privacy Policy - Sexorism',
    url: `${BASE_URL}/privacy`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Sexorism',
      url: BASE_URL,
    },
    about: {
      '@type': 'Organization',
      name: 'Sexorism',
      parentOrganization: { '@type': 'Organization', name: 'Astrox Softech Pvt Ltd' },
      url: BASE_URL,
      logo: `${BASE_URL}/top.png`,
      sameAs: ['https://www.facebook.com/Sexorism'],
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
    dateModified: '2025-10-13',
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
