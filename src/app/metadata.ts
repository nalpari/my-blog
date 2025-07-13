import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: '개발 블로그',
    template: '%s | 개발 블로그',
  },
  description:
    '개발과 일상을 기록하는 개인 블로그입니다. 새로운 기술을 배우고 경험을 공유하며 성장하는 공간입니다.',
  keywords: [
    '개발',
    '프로그래밍',
    '블로그',
    'React',
    'Next.js',
    'TypeScript',
    'JavaScript',
  ],
  authors: [{ name: '개발자' }],
  creator: '개발자',
  publisher: '개발자',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  ),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: '/',
    title: '개발 블로그',
    description: '개발과 일상을 기록하는 개인 블로그입니다.',
    siteName: '개발 블로그',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '개발 블로그',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '개발 블로그',
    description: '개발과 일상을 기록하는 개인 블로그입니다.',
    images: ['/og-image.jpg'],
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
  verification: {
    google: 'your-google-site-verification',
  },
}