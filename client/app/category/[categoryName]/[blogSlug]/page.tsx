import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { cookies } from 'next/headers';
import { Suspense } from 'react';
import BlogDetailClient from './BlogDetailClient';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  (process.env.NODE_ENV !== 'production' ? 'https://api.innvibs.in' : '');

const normalizeCategoryForApi = (s: string) =>
  decodeURIComponent(s || '')
    .toLowerCase()
    .replace(/-and-/g, '-&-') // URL “and” → API “&”
    .replace(/%26/g, '&'); // tolerate encoded &

function currentLang(): 'en' | 'hi' {
  const c = cookies();
  const v = c.get('i18next')?.value || c.get('NEXT_LOCALE')?.value || '';
  return v.toLowerCase().startsWith('hi') ? 'hi' : 'en';
}

export async function generateMetadata({
  params,
}: {
  params: { categoryName: string; blogSlug: string };
}): Promise<Metadata> {
  const lang = currentLang();
  const categoryForApi = normalizeCategoryForApi(params.categoryName);

  const host = headers().get('host');
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || `https://${host}`).replace(/\/$/, '');

  const urlEn = `${siteUrl}/${params.categoryName}/${params.blogSlug}`;
  const urlHi = `${siteUrl}/hi/${params.categoryName}/${params.blogSlug}`;
  const canonical = lang === 'hi' ? urlHi : urlEn;

  try {
    const res = await fetch(
      `${API_BASE}/api/blogs/${encodeURIComponent(categoryForApi)}/${encodeURIComponent(
        params.blogSlug
      )}?lang=${lang}`,
      { cache: 'no-store', headers: { 'Accept-Language': lang } }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const blog = await res.json();

    const titleBase =
      (lang === 'hi'
        ? blog?.metaTitle_hi || blog?.title_hi
        : blog?.metaTitle_en || blog?.title_en || blog?.metaTitle || blog?.title) ||
      'Innvibs Blog';

    const descBase =
      (lang === 'hi'
        ? blog?.metaDescription_hi ||
          (blog?.content_hi || '').replace(/<[^>]*>/g, '').slice(0, 160)
        : blog?.metaDescription_en ||
          blog?.metaDescription ||
          (blog?.content_en || blog?.content || '').replace(/<[^>]*>/g, '').slice(0, 160)) ||
      'Read the latest blog posts and articles on Innvibs';

    const title = `${titleBase} - Innvibs Blog`;
    const description = descBase;

    return {
      title,
      description,
      alternates: {
        canonical,
        languages: { en: urlEn, 'x-default': urlEn, hi: urlHi },
      },
      openGraph: {
        title,
        description,
        url: canonical,
        siteName: 'Innvibs Blog',
        images: [
          {
            url: blog?.image || `${siteUrl}/top.png`,
            width: 1200,
            height: 630,
            alt: titleBase,
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
    console.error('Error fetching blog metadata:', e);
    return {
      title: 'Blog Post - Innvibs',
      description: 'Read the latest blog posts and articles on Innvibs',
      alternates: {
        canonical,
        languages: { en: urlEn, 'x-default': urlEn, hi: urlHi },
      },
    };
  }
}

function safeHtml(html: string) {
  return html || '';
}

interface BlogDetailPageProps {
  params: {
    categoryName: string;
    blogSlug: string;
  };
}

export const dynamic = 'force-dynamic';

export default async function BlogDetailPageRoute({ params }: BlogDetailPageProps) {
  const lang = currentLang();
  const categoryForApi = normalizeCategoryForApi(params.categoryName);

  let blog: any = null;
  try {
    const res = await fetch(
      `${API_BASE}/api/blogs/${encodeURIComponent(categoryForApi)}/${encodeURIComponent(
        params.blogSlug
      )}?lang=${lang}`,
      { cache: 'no-store' }
    );
    if (res.ok) blog = await res.json();
  } catch {
    // swallow; SSR shell is best-effort
  }

  return (
    <>
      <noscript>
        {blog ? (
          <article>
            <h1>{blog.title}</h1>
            {blog?.image ? <img src={blog.image} alt={blog.title} /> : null}
            <div dangerouslySetInnerHTML={{ __html: safeHtml(blog.content || blog.body || '') }} />
          </article>
        ) : (
          <article>
            <h1>Blog</h1>
            <p>Content will appear here.</p>
          </article>
        )}
      </noscript>

      <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
      <BlogDetailClient key={lang} params={params} />
      </Suspense>
    </>
  );
}
