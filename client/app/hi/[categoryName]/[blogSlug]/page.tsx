// client/app/hi/[categoryName]/[blogSlug]/page.tsx
import BlogImpl, {
  generateMetadata as blogGenerateMetadata,
  dynamic as blogDynamic,
} from '../../../category/[categoryName]/[blogSlug]/page';

export const generateMetadata = blogGenerateMetadata;
export const dynamic = blogDynamic;

export default function HiBlogPage({
  params,
}: {
  params: { categoryName: string; blogSlug: string };
}) {
  return <BlogImpl params={params} />;
}
