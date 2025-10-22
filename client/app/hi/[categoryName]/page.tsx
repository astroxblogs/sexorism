// client/app/hi/[categoryName]/page.tsx
import CategoryImpl, {
  generateMetadata as categoryGenerateMetadata,
  dynamic as categoryDynamic,
} from '../../category/[categoryName]/page';

export const generateMetadata = categoryGenerateMetadata;
export const dynamic = categoryDynamic;

export default function HiCategoryPage({ params }: { params: { categoryName: string } }) {
  return <CategoryImpl params={params} />;
}
