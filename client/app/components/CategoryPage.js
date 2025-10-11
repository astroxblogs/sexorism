// app/components/CategoryPage.jsx (server-compatible)
import React from 'react';
import SEO from './SEO';
import HomePage from './HomePage';

export default function CategoryPage({ category, isHi }) {
  if (!category) return <div className="text-center py-20">Category not found.</div>;

  const canonicalPath = `/${category.slug}`;
  const metaTitle =
    category.metaTitle ?? (isHi ? category.metaTitle_hi : category.metaTitle_en);
  const metaDesc =
    category.metaDescription ??
    (isHi ? category.metaDescription_hi : category.metaDescription_en);

  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.name_en} Blogs - Innvibs`,
    description: metaDesc,
    url: `https://www.innvibs.com${canonicalPath}`,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.innvibs.com' },
      { '@type': 'ListItem', position: 2, name: category.name_en, item: `https://www.innvibs.com${canonicalPath}` },
    ],
  };

  return (
    <>
      <SEO
        title={metaTitle}
        description={metaDesc}
        canonicalUrl={canonicalPath}
        schema={[collectionPageSchema, breadcrumbSchema]}
      />
      <HomePage categorySlug={category.slug} />
    </>
  );
}
