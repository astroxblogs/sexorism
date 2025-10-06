import { Metadata } from 'next';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: "About Us - Innvibs",
  description: "Learn more about Innvibs and our mission",
};

export default function AboutPage() {
  return <AboutClient />;
}