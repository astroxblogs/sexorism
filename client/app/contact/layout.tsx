// app/contact/layout.tsx
import type { Metadata } from 'next';
import Script from 'next/script';
import { getBaseUrl } from '..//lib/site'; // <- ensure lib/site.ts exists as shared earlier

const BASE_URL = getBaseUrl();

export const metadata: Metadata = {
  title: 'Contact Us - Innvibs Blog',
  description:
    "Get in touch with the Innvibs team. We'd love to hear from you! Contact us for questions, feedback, or collaboration opportunities.",
  keywords: [
    'contact us',
    'Innvibs contact',
    'get in touch',
    'contact information',
    'blog contact',
    'reach out',
    'collaboration',
    'feedback',
  ],
  authors: [{ name: 'Innvibs Team' }],
  creator: 'Astrox Softech Pvt Ltd',
  publisher: 'Innvibs',
  formatDetection: { email: false, address: false, telephone: false },

  // Dynamic base for prod (.com) and preview/dev (.in)
  metadataBase: new URL(BASE_URL),

  alternates: {
    canonical: '/contact',
  },

  openGraph: {
    title: 'Contact Us - Innvibs Blog',
    description:
      "Get in touch with the Innvibs team. We'd love to hear from you! Contact us for questions, feedback, or collaboration opportunities.",
    url: '/contact', // resolves against metadataBase
    siteName: 'Innvibs Blog',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Innvibs Blog - Contact Us',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us - Innvibs Blog',
    description:
      "Get in touch with the Innvibs team. We'd love to hear from you! Contact us for questions, feedback, or collaboration opportunities.",
    images: ['/logo.png'],
    creator: '@innvibs',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  // JSON-LD: Organization + ContactPoint (domains now dynamic)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Innvibs',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    sameAs: ['https://www.facebook.com/innvibs'],
    parentOrganization: { '@type': 'Organization', name: 'Astrox Softech Pvt Ltd' },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'contact@astroxsoftech.com',
        availableLanguage: ['en', 'hi'],
        areaServed: 'IN',
      },
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Spaze I-Tech Park, Sector 49, Gurgaon-Sohna Road',
      addressLocality: 'Gurugram',
      postalCode: '122018',
      addressCountry: 'IN',
    },
  };

  return (
    <>
      <Script
        id="org-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
