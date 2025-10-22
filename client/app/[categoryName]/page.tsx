import { redirect } from 'next/navigation';
import CategoryImpl, {
  generateMetadata as categoryGenerateMetadata,
  dynamic as categoryDynamic,
} from '../category/[categoryName]/page';

export const generateMetadata = categoryGenerateMetadata;
export const dynamic = categoryDynamic;

type PageProps = { params: { categoryName: string } };

const RESERVED = new Set(['hi','sitemap','tag','search','about','contact','privacy','terms','admin','cms']);

export default function Page({ params }: PageProps) {
  const slug = decodeURIComponent(params?.categoryName || '');
// If user hits a reserved segment via this route:
  if (slug === 'hi') {
    // Hindi homepage should live at /hi (URL stays /hi via middleware rewrite to root content)
    redirect('/hi');  }
 if (RESERVED.has(slug)) redirect('/sitemap');
  return <CategoryImpl params={{ categoryName: slug }} />;
}
