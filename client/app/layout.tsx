import type { Metadata } from 'next'
import { cookies } from 'next/headers';

import GtmTracker from './components/GtmTracker';
import { getBaseUrl } from './lib/site';
import { Inter, Syne, Outfit, Space_Grotesk } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Providers } from './providers'
import NavigationWrapper from './navigation-wrapper'
import Analytics from './components/Analytics'
import I18nProvider from './components/I18nProvider'
import React from 'react'
import RouteAwareChrome from './RouteAwareChrome'
import LangSync from './components/LangSync';
import SplashLoader from './components/SplashLoader';


const BASE_URL = getBaseUrl();
const inter = Inter({ subsets: ['latin'] })
const syne = Syne({ subsets: ['latin'], variable: '--font-syne' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })

// ---------------- SEO metadata (host-aware) ----------------
export function generateMetadata(): Metadata {
    const host = 'www.sexorism.com'; // Update with your domain
    const isPreview = process.env.VERCEL_ENV !== 'production';
  
    const localeCookie =
      (cookies().get('NEXT_LOCALE')?.value || 'en').startsWith('hi') ? 'hi' : 'en';
  
    // ENGLISH
    const titleDefault_en =
      'Sexorism — Erotic Sex Stories, Adult Blogs & Real Pleasure | 18+ Only';
    const desc_en =
      'Explore Sexorism: the ultimate 18+ destination for erotic sex stories, steamy adult blogs, real intimate confessions, pleasure guides & bold fantasies. For adults who dare. Enter now to unlock desire.';
  
    // HINDI Version (you can update if you want)
    const titleDefault_hi =
      'Sexorism — एडल्ट सेक्स स्टोरी, इरोटिक कहानियाँ, और सच्चे संभोग अनुभव | 18+';
    const desc_hi =
      'Sexorism पर पढ़ें: 18+ वयस्कों के लिए इरोटिक सेक्स स्टोरी, बोल्ड फैंटेसी, रीयल लाइफ एक्सपीरियंस और सेक्सुअल आनंद की दुनिया। सिर्फ डेरिंग एडल्ट्स के लिए।';
  
    const isHi = localeCookie === 'hi';
    const titleDefault = isHi ? titleDefault_hi : titleDefault_en;
    const descDefault = isHi ? desc_hi : desc_en;
  
    return {
      metadataBase: new URL(`https://${host}`),
      title: {
        default: titleDefault,
        template: '%s ',
      },
      description: descDefault,
      keywords: [
        'sex stories',
        'erotic stories',
        'adult blog',
        'bold stories',
        '18+ content',
        'pleasure blog',
        'sexual health',
        'real confessions',
        'intimate tales',
       'sexorism',
      ],
      authors: [{ name: 'Sexorism' }],
      creator: 'Sexorism',
      publisher: 'Sexorism',
      formatDetection: { email: false, address: false, telephone: false },
      openGraph: {
        type: 'website',
        locale: isHi ? 'hi_IN' : 'en_US',
        url: '/',
        siteName: 'Sexorism',
        title: titleDefault,
        description: descDefault,
        images: [{ url: '/top.png', width: 1200, height: 630, alt: 'Sexorism — Erotic Adult Stories' }],
      },
      twitter: {
        card: 'summary_large_image',
        title: titleDefault,
        description: descDefault,
        images: ['/top.png'],
        creator: '@sexorism',
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
        google: 'your-google-verification-code',
      },
    };
  }
  



// ---------------- JSON-LD Schemas ----------------
const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Sexorism',
    alternateName: 'Sexorism 18+',
    url: BASE_URL,
    logo: `${BASE_URL}/top.png`,
    description:
      'Sexorism is India’s most daring and bold platform for adult sex stories, real-life confessions, pleasure tips and erotic fiction. For 18+ only.',
    foundingDate: '2025',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'contact@sexorism.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Your address here',
        addressLocality: 'City',
        postalCode: '000000',
        addressCountry: 'IN',
      },
    },
    sameAs: ['https://www.facebook.com/sexorism'],
    knowsAbout: ['Sex Stories', 'Erotic Content', 'Adult Blogs', '18+ Experiences'],
  }
  
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Sexorism',
    url: BASE_URL,
    description:
      'Read bold, erotic sex stories and adult blogs for 18+ only. Discover fantasies, real confessions and pleasure guides exclusively on Sexorism.',
    publisher: { '@type': 'Organization', name: 'Sexorism', url: BASE_URL },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BASE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
  

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // read cookie set by middleware to control <html lang>
  const locale = (cookies().get('NEXT_LOCALE')?.value || 'en').startsWith('hi') ? 'hi' : 'en';

  // Check if running on main domain (not Vercel preview)
  const isProductionDomain = process.env.NODE_ENV === 'production' &&
    !process.env.VERCEL_URL?.includes('vercel.app');

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>

{isProductionDomain && (
  <>
    {/* === Ezoic Privacy Scripts (must be first) === */}
    <Script
      id="ezoic-privacy-min"
      src="https://cmp.gatekeeperconsent.com/min.js"
      strategy="beforeInteractive"
      // @ts-ignore - allow custom data-* attr to pass through
      data-cfasync="false"
    />
    <Script
      id="ezoic-privacy-cmp"
      src="https://the.gatekeeperconsent.com/cmp.min.js"
      strategy="beforeInteractive"
      // @ts-ignore
      data-cfasync="false"
    />

    {/* NEW: guard so sa.min.js always finds the queue */}
    <Script id="ezoic-guard" strategy="beforeInteractive">
      {`window._ezaq = window._ezaq || [];`}
    </Script>

    {/* === Ezoic Header Script (after privacy) === */}
    <Script
      id="ezoic-header"
      src="//www.ezojs.com/ezoic/sa.min.js"
      async
      strategy="beforeInteractive"
    />
    <Script id="ezoic-header-init" strategy="beforeInteractive">
      {`window.ezstandalone = window.ezstandalone || {}; ezstandalone.cmd = ezstandalone.cmd || [];`}
    </Script>
  </>
)}

        {/* Consent Mode v2: set default denied BEFORE anything else (kept as-is) */}
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

        {isProductionDomain && (
          <>
            {/*  Google AdSense (single canonical domain) */}
            <meta name="google-adsense-account" content="ca-pub-4112734313230332" />
            <Script
              id="adsense-loader"
              strategy="afterInteractive"
              async
              src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4112734313230332"
              crossOrigin="anonymous"
            />

            {/*  Funding Choices (Consent messages) — also on BOTH domains */}
            <Script
              id="funding-choices"
              src="https://fundingchoicesmessages.google.com/i/pub-4112734313230332?ers=1"
              async
              strategy="afterInteractive"
            />
            <Script id="funding-choices-present" strategy="afterInteractive">
              {`(function(){function signalGooglefcPresent(){if(!window.frames['googlefcPresent']){if(document.body){const iframe=document.createElement('iframe');iframe.style='width: 0; height: 0; border: none; z-index: -1000; left: -1000px; top: -1000px;';iframe.style.display='none';iframe.name='googlefcPresent';document.body.appendChild(iframe);}else{setTimeout(signalGooglefcPresent,0);}}}signalGooglefcPresent();})();`}
            </Script>
          </>
        )}


  {/*  Additional Script */}
{/* <script src="https://fpyf8.com/88/tag.min.js" data-zone="184469" async data-cfasync="false"></script> */}


      </head>

      <body className={`${inter.className} ${syne.variable} ${outfit.variable} ${spaceGrotesk.variable}`}>
        {/* No unconditional GTM noscript */}
        <SplashLoader />
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

{isProductionDomain && (
  <>
    <Script id="infolinks-init" strategy="afterInteractive">
      {`
        var infolinks_pid = 3441548;
        var infolinks_wsid = 0;
      `}
    </Script>

    <Script
      id="infolinks-main"
      src="https://resources.infolinks.com/js/infolinks_main.js"
      strategy="afterInteractive"
    />
  </>
)}
 
 


      </body>
    </html>
  )
}
