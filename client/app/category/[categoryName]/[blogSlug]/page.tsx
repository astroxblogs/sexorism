import { Metadata } from 'next';
import BlogDetailClient from './BlogDetailClient';

// Generate metadata dynamically for each blog post
export async function generateMetadata({ params }: { params: { categoryName: string; blogSlug: string } }): Promise<Metadata> {
  try {
    // Fetch blog data from your API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/api/blogs/${params.categoryName}/${params.blogSlug}`, {
      cache: 'no-store'
    });

    if (response.ok) {
      const blog = await response.json();

      return {
        title: `${blog.title} - Innvibs Blog`,
        description: blog.excerpt || blog.content?.substring(0, 160) || 'Read this amazing blog post on Innvibs',
        keywords: blog.tags?.join(', ') || 'blog, article, lifestyle',
        authors: [{ name: blog.author || 'Innvibs Team' }],
        openGraph: {
          title: `${blog.title} - Innvibs Blog`,
          description: blog.excerpt || blog.content?.substring(0, 160) || 'Read this amazing blog post on Innvibs',
          url: `/category/${params.categoryName}/${params.blogSlug}`,
          siteName: 'Innvibs Blog',
          images: [
            {
              url: blog.image || '/logo.png',
              width: 1200,
              height: 630,
              alt: blog.title,
            },
          ],
          locale: 'en_US',
          type: 'article',
          publishedTime: blog.createdAt,
          modifiedTime: blog.updatedAt,
          authors: [blog.author || 'Innvibs Team'],
          tags: blog.tags || [],
        },
        twitter: {
          card: 'summary_large_image',
          title: `${blog.title} - Innvibs Blog`,
          description: blog.excerpt || blog.content?.substring(0, 160) || 'Read this amazing blog post on Innvibs',
          images: [blog.image || '/logo.png'],
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
    }
  } catch (error) {
    console.error('Error fetching blog metadata:', error);
  }

  // Fallback metadata
  return {
    title: "Blog Post - Innvibs",
    description: "Read the latest blog posts and articles on Innvibs",
  };
}

interface BlogDetailPageProps {
  params: {
    categoryName: string;
    blogSlug: string;
  };
}

export default function BlogDetailPageRoute({ params }: BlogDetailPageProps) {
  return <BlogDetailClient params={params} />;
}