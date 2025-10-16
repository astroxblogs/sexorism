import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Suspense } from 'react';
import BlogDetailClient from '../../../../category/[categoryName]/[blogSlug]/BlogDetailClient';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  (process.env.NODE_ENV !== 'production' ? 'https://api.innvibs.in' : '');

const normalizeCategoryForApi = (s: string) =>
  decodeURIComponent(s || '')
    .toLowerCase()
    .replace(/-and-/g, '-&-')
    .replace(/%26/g, '&');

function stripHtml(html: string) {
  return (html || '').replace(/<[^>]*>/g, '');
}

export async function generateMetadata({
  params,
}: {
  params: { categoryName: string; blogSlug: string };
}): Promise<Metadata> {
  const categoryForApi = normalizeCategoryForApi(params.categoryName);

  const siteUrlEnv = process.env.NEXT_PUBLIC_SITE_URL;
  const host = headers().get('host') || 'www.innvibs.in';
  const siteUrl = siteUrlEnv || `https://${host}`;

  const urlCurrent = `${siteUrl}/hi/${params.categoryName}/${params.blogSlug}`;
  const urlEn = `${siteUrl}/${params.categoryName}/${params.blogSlug}`;
  const urlHi = `${siteUrl}/hi/${params.categoryName}/${params.blogSlug}`;

  try {
    const res = await fetch(
      `${API_BASE}/api/blogs/${encodeURIComponent(categoryForApi)}/${encodeURIComponent(
        params.blogSlug
      )}`,
      { cache: 'no-store' }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const blog = await res.json();

    const titleRaw =
      blog?.metaTitle_hi || blog?.title_hi || blog?.metaTitle_en || blog?.title;
    const descRaw =
      blog?.metaDescription_hi ||
      stripHtml(blog?.content_hi || blog?.content_en || blog?.content || '').slice(0, 160);

    const title = titleRaw ? `${titleRaw} - Innvibs Blog` : 'Innvibs Blog';
    const description =
      (descRaw || 'Read the latest blog posts and articles on Innvibs') +
      (descRaw && descRaw.length >= 160 ? '…' : '');

    return {
      title,
      description,
      alternates: {
        canonical: urlCurrent,
        languages: { en: urlEn, hi: urlHi },
      },
      openGraph: {
        title,
        description,
        url: urlCurrent,
        siteName: 'Innvibs Blog',
        images: [
          {
            url: blog?.image || `${siteUrl}/top.png`,
            width: 1200,
            height: 630,
            alt: titleRaw || 'Innvibs',
          },
        ],
        type: 'article',
        publishedTime: blog?.date || blog?.createdAt,
        modifiedTime: blog?.updatedAt,
        authors: [blog?.createdBy || 'Innvibs'],
        tags: blog?.tags || [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [blog?.image || `${siteUrl}/top.png`],
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
    };
  } catch (e) {
    console.error('Error fetching blog metadata (hi route):', e);
    return {
      title: 'Blog Post - Innvibs',
      description: 'Read the latest blog posts and articles on Innvibs',
      alternates: {
        canonical: urlCurrent,
        languages: { en: urlEn, hi: urlHi },
      },
    };
  }
}

interface BlogDetailPageProps {
  params: { categoryName: string; blogSlug: string };
}

export const dynamic = 'force-dynamic';

export default async function BlogDetailHiPage({ params }: BlogDetailPageProps) {
  const categoryForApi = normalizeCategoryForApi(params.categoryName);

  let blog: any = null;
  try {
    const res = await fetch(
      `${API_BASE}/api/blogs/${encodeURIComponent(categoryForApi)}/${encodeURIComponent(
        params.blogSlug
      )}`,
      { cache: 'no-store' }
    );
    if (res.ok) blog = await res.json();
  } catch {}

  const ssrTitle = blog?.title_hi || blog?.title_en || blog?.title || 'Blog';
  const ssrContent = blog?.content_hi || blog?.content_en || blog?.content || '';

  return (
    <>
      <noscript>
        {blog ? (
          <article>
            <h1>{ssrTitle}</h1>
            {blog?.image ? <img src={blog.image} alt={ssrTitle} /> : null}
            <div dangerouslySetInnerHTML={{ __html: ssrContent }} />
          </article>
        ) : (
          <article>
            <h1>Blog</h1>
            <p>Content will appear here.</p>
          </article>
        )}
      </noscript>

      <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
        <BlogDetailClient params={{ categoryName: params.categoryName, blogSlug: params.blogSlug }} />
      </Suspense>
    </>
  );
}
