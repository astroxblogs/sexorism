// client/src/components/SEO.js

import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * A reusable SEO component to manage head tags.
 *
 * @param {object} props - The component props.
 * @param {string} props.title - The title of the page.
 * @param {string} props.description - The meta description of the page.
 * @param {string} [props.canonicalUrl] - The canonical URL of the page.
 * @param {object|object[]} [props.schema] - The JSON-LD schema object or an array of schema objects.
 */
const SEO = ({ title, description, canonicalUrl, schema }) => {
  // The base URL of your site, update this to your domain
  const siteUrl = 'https://www.innvibs.com';
  
  // Construct the full canonical URL if a path is provided
  const fullCanonicalUrl = canonicalUrl ? `${siteUrl}${canonicalUrl}` : siteUrl;
  
  // Ensure schema is always an array to handle single or multiple schemas easily
  const schemaArray = Array.isArray(schema) ? schema : schema ? [schema] : [];

  return (
    <Helmet>
      {/* General tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {canonicalUrl && <link rel="canonical" href={fullCanonicalUrl} />}

      {/* JSON-LD Structured Data */}
      {schemaArray.length > 0 &&
        schemaArray.map((schemaItem, index) => (
          <script key={`schema-${index}`} type="application/ld+json">
            {JSON.stringify(schemaItem)}
          </script>
        ))}
    </Helmet>
  );
};

export default SEO;