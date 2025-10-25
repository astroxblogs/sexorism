import type { Metadata } from 'next'
import { cookies, headers } from 'next/headers'; // ✅ added headers
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
  // ✅ detect host at request-time (works on Vercel/Node)
  const h = headers();
  const rawHost =
    (h.get('x-forwarded-host') || h.get('host') || 'www.innvibs.com').toLowerCase();
  const host = rawHost.split(',')[0].trim(); // in case of multiple values
  const isMainSite = host.endsWith('innvibs.com'); // ✅ only main domain uses AdSense
  const isPreview = process.env.VERCEL_ENV !== 'production';

  // 👇 read locale cookie here too (same logic you already use in <html lang>)
  const localeCookie =
    (cookies().get('NEXT_LOCALE')?.value || 'en').startsWith('hi') ? 'hi' : 'en';

  const titleDefault_en =
    'Inner Vibes  - Technology, Travel, Health, Lifestyle, Trends, Sports, Fashion with Vastu & Astro - innvibs.com';
  const desc_en =
    'Discover the world of Lifestyle, Fashion, Travel, Sports, Technology, Astrology, and Vastu Shastra at Innvibs — your trusted destination for daily inspiration, trending ideas, and expert insights. Explore fashion trends, travel guides, health and fitness tips, tech innovations, spiritual wisdom, and vastu-based home solutions. Stay updated, stay inspired — Inner Vibes: Explore Inside, Express Outside.';

  // ✅ Hindi defaults used only when browsing under /hi (page-level metadata can still override)
  const titleDefault_hi =
    'Inner vibes — टेक्नोलॉजी, ट्रैवल, हेल्थ, लाइफस्टाइल, ट्रेंड्स, स्पोर्ट्स, फैशन, वास्तु व ज्योतिष - innvibs.com';
  const desc_hi =
    'लाइफस्टाइल, फैशन, ट्रैवल, स्पोर्ट्स, टेक्नोलॉजी, ज्योतिष और वास्तु शास्त्र पर रोज़ाना प्रेरक कंटेंट, ट्रेंडिंग आइडियाज़ और विशेषज्ञ इनसाइट्स — Innvibs पर पढ़ें।';

  const isHi = localeCookie === 'hi';
  const titleDefault = isHi ? titleDefault_hi : titleDefault_en;
  const descDefault = isHi ? desc_hi : desc_en;

  return {
    metadataBase: new URL(`https://${host}`), // ✅ host-aware
    title: {
      default: titleDefault,
      template: '%s ',
    },
    description: descDefault,
    keywords: [
      'blog',
      'lifestyle',
      'fashion',
      'technology',
      'travel',
      'sports',
      'astrology',
      'vastu shastra',
      'articles',
      'insights',
    ],
    authors: [{ name: 'Innvibs' }],
    creator: 'Astrox Softech Pvt Ltd',
    publisher: 'Innvibs',
    formatDetection: { email: false, address: false, telephone: false },
    openGraph: {
      type: 'website',
      locale: isHi ? 'hi_IN' : 'en_US',
      url: '/',
      siteName: 'Innvibs Blog',
      title: titleDefault,
      description: descDefault,
      images: [{ url: '/top.png', width: 1200, height: 630, alt: 'Innvibs Blog' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: titleDefault,
      description: descDefault,
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
    // ✅ keep search console verification only on main site (optional)
    verification: isMainSite
      ? { google: 'your-google-verification-code' }
      : undefined,
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
  // read cookie set by middleware to control <html lang>
  const locale = (cookies().get('NEXT_LOCALE')?.value || 'en').startsWith('hi') ? 'hi' : 'en';

  // ✅ detect host here too to conditionally load AdSense
  const h = headers();
  const rawHost =
    (h.get('x-forwarded-host') || h.get('host') || 'www.innvibs.com').toLowerCase();
  const host = rawHost.split(',')[0].trim();
  const isMainSite = host.endsWith('innvibs.com');

  return (
    <html lang={locale} suppressHydrationWarning>
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

        {/* ✅ AdSense tags ONLY on innvibs.com */}
        {isMainSite && (
          <>
            <meta name="google-adsense-account" content="ca-pub-4112734313230332" />
            <Script
              id="adsense-loader"
              strategy="afterInteractive"
              async
              src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4112734313230332"
              crossOrigin="anonymous"
            />
          </>
        )}
      </head>

      <body className={inter.className}>
        {/* ❌ No unconditional GTM noscript */}
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
