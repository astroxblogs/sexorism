import { Metadata } from 'next';
import BlogDetailClient from './BlogDetailClient';

// Generate metadata dynamically for each blog post
export async function generateMetadata({ params }: { params: { categoryName: string; blogSlug: string } }): Promise<Metadata> {
  try {
    // Fetch blog data from your API
    const response = await fetch(`https://api.innvibs.in/api/blogs/${params.categoryName}/${params.blogSlug}`, {
      cache: 'no-store'
    });

    if (response.ok) {
       const blog = await response.json();

       // Create excerpt from content (remove HTML tags and get first 160 characters)
       const createExcerpt = (content) => {
         if (!content) return 'Read this amazing blog post on Innvibs';
         const textContent = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
         return textContent.substring(0, 160) + (textContent.length > 160 ? '...' : '');
       };

       const excerpt = createExcerpt(blog.content);

       return {
         title: `${blog.title} - Innvibs Blog`,
         description: excerpt,
         keywords: blog.tags?.join(', ') || 'blog, article, lifestyle',
         authors: [{ name: blog.createdBy || 'Innvibs Team' }],
         openGraph: {
           title: `${blog.title} - Innvibs Blog`,
           description: excerpt,
           url: `https://www.innvibs.in/category/${params.categoryName}/${params.blogSlug}`,
           siteName: 'Innvibs Blog',
           images: [
             {
               url: blog.image || 'https://www.innvibs.in/logo.png',
               width: 1200,
               height: 630,
               alt: blog.title,
             },
           ],
           locale: 'en_US',
           type: 'article',
           publishedTime: blog.date || blog.createdAt,
           modifiedTime: blog.updatedAt,
           authors: [blog.createdBy || 'Innvibs Team'],
           tags: blog.tags || [],
         },
         twitter: {
           card: 'summary_large_image',
           title: `${blog.title} - Innvibs Blog`,
           description: excerpt,
           images: [blog.image || 'https://www.innvibs.in/logo.png'],
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