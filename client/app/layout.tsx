import type { Metadata } from 'next'

import GtmTracker from './components/GtmTracker';
import { getBaseUrl } from './lib/site';
import { Inter } from 'next/font/google'
import { headers } from 'next/headers'
import Script from 'next/script'
import './globals.css'
import { Providers } from './providers'
import NavigationWrapper from './navigation-wrapper'
import Analytics from './components/Analytics'
// import { HeaderAd, FooterAd } from './components/AdSense'
import I18nProvider from './components/I18nProvider'
import React from 'react'
import RouteAwareChrome from './RouteAwareChrome'
import LangSync from './components/LangSync';

const BASE_URL = getBaseUrl();
const inter = Inter({ subsets: ['latin'] })

// ---------------- SEO metadata (host-aware) ----------------
export function generateMetadata(): Metadata {
  const host = (headers().get('host') || 'www.innvibs.com').toLowerCase();
  const isPreview =
    host.endsWith('.in') || host.includes('localhost') || host.startsWith('127.0.0.1');

  return {
    metadataBase: new URL(`https://${host}`),
    title: {
      default:
        'Inner Vibes  - Technology, Travel, Health, Lifestyle, Trends, Sports, Fashion with Vastu & Astro - innvibs.com',
      template: '%s | Innvibs Blog'
    },
    description:
      'Discover the world of Lifestyle, Fashion, Travel, Sports, Technology, Astrology, and Vastu Shastra at Innvibs — your trusted destination for daily inspiration, trending ideas, and expert insights. Explore fashion trends, travel guides, health and fitness tips, tech innovations, spiritual wisdom, and vastu-based home solutions. Stay updated, stay inspired — Inner Vibes: Explore Inside, Express Outside.',
    keywords: ['blog', 'lifestyle', 'fashion', 'technology', 'travel', 'sports', 'astrology', 'vastu shastra', 'articles', 'insights'],
    authors: [{ name: 'Innvibs' }],
    creator: 'Astrox Softech Pvt Ltd',
    publisher: 'Innvibs',
    formatDetection: { email: false, address: false, telephone: false },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: '/',
      siteName: 'Innvibs Blog',
      title:
        'Inner Vibes  - Technology, Travel, Health, Lifestyle, Trends, Sports, Fashion with Vastu & Astro - innvibs.com',
      description:
        'Discover the world of Lifestyle, Fashion, Travel, Sports, Technology, Astrology, and Vastu Shastra at Innvibs — your trusted destination for daily inspiration, trending ideas, and expert insights. Explore fashion trends, travel guides, health and fitness tips, tech innovations, spiritual wisdom, and vastu-based home solutions. Stay updated, stay inspired — Inner Vibes: Explore Inside, Express Outside.',
      images: [{ url: '/top.png', width: 1200, height: 630, alt: 'Innvibs Blog' }],
    },
    twitter: {
      card: 'summary_large_image',
      title:
        'Inner Vibes  - Technology, Travel, Health, Lifestyle, Trends, Sports, Fashion with Vastu & Astro - innvibs.com',
      description:
        'Discover the world of Lifestyle, Fashion, Travel, Sports, Technology, Astrology, and Vastu Shastra at Innvibs — your trusted destination for daily inspiration, trending ideas, and expert insights. Explore fashion trends, travel guides, health and fitness tips, tech innovations, spiritual wisdom, and vastu-based home solutions. Stay updated, stay inspired — Inner Vibes: Explore Inside, Express Outside.',
      images: ['/top.png'],
      creator: '@innvibs',
    },
    robots: isPreview
      ? {
          index: false,
          follow: false,
          googleBot: { index: false, follow: false },
        }
      : {
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
    verification: {
      google: 'your-google-verification-code', // TODO: replace with real code
    },
  };
}

// ---------------- JSON-LD Schemas ----------------
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Innvibs',
  alternateName: 'Innvibs Blog',
  url: BASE_URL,
  logo: `${BASE_URL}/top.png`,
  description:
    'Your daily source for insightful articles on lifestyle, fashion, technology, travel, sports, astrology, and Vastu Shastra.',
  foundingDate: '2023',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    email: 'contact@astroxsoftech.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Spaze I-Tech Park, Sector 49, Gurgaon-Sohna Road',
      addressLocality: 'Gurugram',
      postalCode: '122018',
      addressCountry: 'IN',
    },
  },
  sameAs: ['https://www.facebook.com/innvibs'],
  knowsAbout: ['Lifestyle', 'Fashion', 'Technology', 'Travel', 'Sports', 'Astrology', 'Vastu Shastra'],
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Innvibs Blog',
  url: BASE_URL,
  description:
    'Your daily source for insightful articles on lifestyle, fashion, technology, travel, sports, astrology, and Vastu Shastra.',
  publisher: { '@type': 'Organization', name: 'Innvibs', url: BASE_URL },
  potentialAction: {
    '@type': 'SearchAction',
    target: `${BASE_URL}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* ✅ GTM loader (in head via next/script) */}
        <Script id="gtm-loader" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-PJPB3FJL');
          `}
        </Script>

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>

      <body className={inter.className}>
        {/* ✅ Required GTM noscript fallback — must be the first thing in <body> */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PJPB3FJL"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

        {/* i18n wraps Providers so any child can use useTranslation safely */}
        <I18nProvider>
          {/* keep API language synced with i18n in a tiny client component */}
          <LangSync />

          <Providers>
            <Analytics />
            <NavigationWrapper>
              {/* <HeaderAd /> */}
              <GtmTracker />
              <RouteAwareChrome>{children}</RouteAwareChrome>
              {/* <FooterAd /> */}
            </NavigationWrapper>
          </Providers>
        </I18nProvider>
      </body>
    </html>
  )
}
