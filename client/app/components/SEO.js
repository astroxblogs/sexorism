'use client';

import React from 'react';
import Head from 'next/head';

/**
 * SEO component:
 * - Renders ONLY the tags you provide (no defaults).
 * - Avoids overriding server metadata if a prop is undefined.
 * - Canonical uses current origin or NEXT_PUBLIC_SITE_URL.
 */
const SEO = ({ title, description, canonicalUrl, schema }) => {
  // Determine site origin safely for preview/prod
  const runtimeOrigin =
    (typeof window !== 'undefined' && window.location?.origin) ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    ''; // empty means we'll skip absolute canonical if we can't build it

  // Build absolute canonical only if we have a path and an origin
  let fullCanonicalUrl;
  if (canonicalUrl) {
    fullCanonicalUrl = canonicalUrl.startsWith('http')
      ? canonicalUrl
      : (runtimeOrigin ? `${runtimeOrigin}${canonicalUrl}` : undefined);
  }

  const schemaArray = Array.isArray(schema) ? schema : schema ? [schema] : [];


// derive locale for OG from cookie or path (no UI change)
let ogLocale = 'en_US';
try {
  const cookieMatch = typeof document !== 'undefined' && document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=(hi|en)/i);
  const fromCookie = cookieMatch && cookieMatch[1]?.toLowerCase();
  const pathIsHi = typeof window !== 'undefined' && window.location?.pathname?.startsWith('/hi/');
  if (fromCookie === 'hi' || pathIsHi) ogLocale = 'hi_IN';
} catch {}


  return (
    <Head>
      {/* Render ONLY when provided so we don't override server tags */}
      {title !== undefined && <title>{title}</title>}
      {description !== undefined && (
        <meta name="description" content={description} />
      )}
      {fullCanonicalUrl && <link rel="canonical" href={fullCanonicalUrl} />}

      {/* Open Graph */}
      {title !== undefined && (
        <meta property="og:title" content={title} />
      )}
      {description !== undefined && (
        <meta property="og:description" content={description} />
      )}
      {fullCanonicalUrl && <meta property="og:url" content={fullCanonicalUrl} />}
      <meta property="og:type" content="website" />
      
      {<meta property="og:locale" content={ogLocale} />}


      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      {title !== undefined && (
        <meta name="twitter:title" content={title} />
      )}
      {description !== undefined && (
        <meta name="twitter:description" content={description} />
      )}

      {/* JSON-LD */}
      {schemaArray.map((schemaItem, idx) => (
        <script
          key={`schema-${idx}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaItem) }}
        />
      ))}
    </Head>
  );
};

export default SEO;
