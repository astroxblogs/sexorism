import type { Metadata } from 'next'

import GtmTracker from './components/GtmTracker';
import { getBaseUrl } from './lib/site';
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Providers } from './providers'
import NavigationWrapper from './navigation-wrapper'
import Analytics from './components/Analytics'
import I18nProvider from './components/I18nProvider'
import React from 'react'
import RouteAwareChrome from './RouteAwareChrome'
import LangSync from './components/LangSync';

const BASE_URL = getBaseUrl();
const inter = Inter({ subsets: ['latin'] })

// ---------------- SEO metadata (host-aware) ----------------
export function generateMetadata(): Metadata {
  // NOTE: headers() removed here to keep this file purely server-safe without dynamic host checks for this update.
  const host = 'www.innvibs.com';
  const isPreview = false;

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
        {/* ✅ Consent Mode v2: set default denied BEFORE anything else */}
        <Script id="consent-mode" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              'ad_storage': 'denied',
              'analytics_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied'
            });
            // Helper to load GTM after consent
            window.__loadGTM = function(id){
              if (window.__gtmLoaded) return;
              window.__gtmLoaded = true;
              var s = document.createElement('script');
              s.async = true;
              s.src = 'https://www.googletagmanager.com/gtm.js?id=' + id + '&l=dataLayer';
              document.head.appendChild(s);
              // Signal GTM start
              window.dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
            };
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
        {/* ❌ Removed unconditional GTM <noscript> to ensure it doesn't load before consent.
            It will render conditionally from the client once consent is granted. */}

        <I18nProvider>
          <LangSync />
          <Providers>
            <Analytics />
            <NavigationWrapper>
              <GtmTracker />
              <RouteAwareChrome>{children}</RouteAwareChrome>
            </NavigationWrapper>
          </Providers>
        </I18nProvider>
      </body>
    </html>
  )
}
