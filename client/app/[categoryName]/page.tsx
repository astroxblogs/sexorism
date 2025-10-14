import { redirect } from 'next/navigation';
import CategoryImpl, {
  generateMetadata as categoryGenerateMetadata,
  dynamic as categoryDynamic,
} from '../category/[categoryName]/page';

export const generateMetadata = categoryGenerateMetadata;
export const dynamic = categoryDynamic;

type PageProps = { params: { categoryName: string } };

const RESERVED = new Set(['sitemap','tag','search','about','contact','privacy','terms','admin','cms']);

export default function Page({ params }: PageProps) {
  const slug = decodeURIComponent(params?.categoryName || '');
  if (RESERVED.has(slug)) redirect('/sitemap');
  return <CategoryImpl params={{ categoryName: slug }} />;
}
