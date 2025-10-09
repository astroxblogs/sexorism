import type { Metadata } from 'next'
import { getBaseUrl } from './lib/site';

import { Inter } from 'next/font/google'
import { headers } from 'next/headers'
import './globals.css'
import { Providers } from './providers'
import NavigationWrapper from './navigation-wrapper'
import Breadcrumbs from './components/Breadcrumbs'
import Analytics from './components/Analytics'
import { HeaderAd, FooterAd } from './components/AdSense'
import I18nProvider from './components/I18nProvider'
import React from 'react'
// app/layout.tsx
import RouteAwareChrome from './RouteAwareChrome'; // <-- ADD THIS import

const BASE_URL = getBaseUrl();

const inter = Inter({ subsets: ['latin'] })

// Function to detect if we're on testing domain
function isTestingDomain(): boolean {
  // During build time, default to false (production behavior)
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return false
  }

  if (typeof window !== 'undefined') {
    // Client-side detection
    return window.location.hostname === 'innvibs.in' ||
           window.location.hostname.includes('localhost') ||
           window.location.hostname.includes('127.0.0.1')
  }

  // Server-side detection - only call headers() when actually serving requests
  try {
    const headersList = headers()
    const host = headersList.get('host') || ''
    return host === 'innvibs.in' ||
           host.includes('localhost') ||
           host.includes('127.0.0.1')
  } catch (error) {
    // Fallback during build time or when headers() is not available
    return false
  }
}

// Global metadata for the entire site
export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Inner Vibes: Technology, Travel, Health, Lifestyle, Trends, Sports, Fashion with Vastu & Astro',
    template: '%s | Innvibs Blog'
  },
  description: 'Discover insightful articles on lifestyle, fashion, technology, travel, sports, astrology, and Vastu Shastra. Your trusted source for daily inspiration and knowledge.',
  keywords: ['blog', 'lifestyle', 'fashion', 'technology', 'travel', 'sports', 'astrology', 'vastu shastra', 'articles', 'insights'],
  authors: [{ name: 'Innvibs Team' }],
  creator: 'Astrox Softech Pvt Ltd',
  publisher: 'Innvibs',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Innvibs Blog',
    title: 'Inner Vibes: Technology, Travel, Health, Lifestyle, Trends, Sports, Fashion with Vastu & Astro',
    description: 'Discover insightful articles on lifestyle, fashion, technology, travel, sports, astrology, and Vastu Shastra.',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Innvibs Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inner Vibes: Technology, Travel, Health, Lifestyle, Trends, Sports, Fashion with Vastu & Astro',
    description: 'Discover insightful articles on lifestyle, fashion, technology, travel, sports, astrology, and Vastu Shastra.',
    images: ['/logo.png'],
    creator: '@innvibs',
  },
  robots: isTestingDomain() ? {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  } : {
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
    google: 'your-google-verification-code', // Add your Google verification code
  },
}

// Organization schema for the entire site
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Innvibs",
  "alternateName": "Innvibs Blog",
  "url":  BASE_URL,
  "logo": `${BASE_URL}/logo.png`,
  "description": "Your daily source for insightful articles on lifestyle, fashion, technology, travel, sports, astrology, and Vastu Shastra.",
  "foundingDate": "2023",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "email": "contact@astroxsoftech.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Spaze I-Tech Park, Sector 49, Gurgaon-Sohna Road",
      "addressLocality": "Gurugram",
      "postalCode": "122018",
      "addressCountry": "IN"
    }
  },
  "sameAs": [
    "https://www.facebook.com/innvibs"
  ],
  "knowsAbout": [
    "Lifestyle",
    "Fashion",
    "Technology",
    "Travel",
    "Sports",
    "Astrology",
    "Vastu Shastra"
  ]
}

// Website schema
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Innvibs Blog",
  "url":BASE_URL,
  "description": "Your daily source for insightful articles on lifestyle, fashion, technology, travel, sports, astrology, and Vastu Shastra.",
  "publisher": {
    "@type": "Organization",
    "name": "Innvibs",
    "url": BASE_URL,
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": `${BASE_URL}/search?q={search_term_string}`,

    "query-input": "required name=search_term_string"
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <I18nProvider>
            <Analytics />
            <NavigationWrapper>
  <HeaderAd />
  {/* REMOVE this: <Breadcrumbs /> */}
  <RouteAwareChrome>
    {children}
  </RouteAwareChrome>
  <FooterAd />
</NavigationWrapper>
          </I18nProvider>
        </Providers>
      </body>
    </html>
  )
}