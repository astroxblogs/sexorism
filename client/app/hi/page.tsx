// client/app/hi/page.tsx
import HomeImpl, { generateMetadata as homeGenerateMetadata, dynamic as homeDynamic } from '../page';

export const generateMetadata = homeGenerateMetadata;
export const dynamic = homeDynamic;

export default function HiHome() {
  return <HomeImpl />;
}
