import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us - Innvibs Blog',
  description: 'Get in touch with the Innvibs team. We\'d love to hear from you! Contact us for questions, feedback, or collaboration opportunities.',
  keywords: ['contact us', 'Innvibs contact', 'get in touch', 'contact information', 'blog contact', 'reach out', 'collaboration', 'feedback'],
  authors: [{ name: 'Innvibs Team' }],
  creator: 'Astrox Softech Pvt Ltd',
  publisher: 'Innvibs',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://innvibs.com'),
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Us - Innvibs Blog',
    description: 'Get in touch with the Innvibs team. We\'d love to hear from you! Contact us for questions, feedback, or collaboration opportunities.',
    url: '/contact',
    siteName: 'Innvibs Blog',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Innvibs Blog - Contact Us',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us - Innvibs Blog',
    description: 'Get in touch with the Innvibs team. We\'d love to hear from you! Contact us for questions, feedback, or collaboration opportunities.',
    images: ['/logo.png'],
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
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}