import { notFound } from 'next/navigation'
import { blogApi } from '@/lib/prisma'
import { PostDetailPage } from '@/components/custom/post-detail-page'
import { Metadata } from 'next'

interface PostPageProps {
  params: Promise<{ slug: string }>
}

// 정적 매개변수 생성 (SEO 최적화)
export async function generateStaticParams() {
  try {
    const { data: posts } = await blogApi.getPosts({ page: 1, limit: 100 })
    return posts?.map((post) => ({ slug: post.slug })) || []
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

// 동적 메타데이터 생성 (SEO 최적화)
export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  const { data: post } = await blogApi.getPostBySlug(slug)

  if (!post) {
    return {
      title: '포스트를 찾을 수 없습니다',
      description: '요청하신 포스트를 찾을 수 없습니다.',
    }
  }

  const description = post.content.slice(0, 160) + '...'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'
  const postUrl = `${siteUrl}/blog/${post.slug}`

  return {
    title: post.title,
    description,
    keywords: [...post.tags, '개발', '프로그래밍', '블로그'],
    authors: [{ name: '개발자' }],
    creator: '개발자',
    publisher: '개발 블로그',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      title: post.title,
      description,
      url: postUrl,
      siteName: '개발 블로그',
      locale: 'ko_KR',
      type: 'article',
      publishedTime: post.published_at || post.created_at,
      authors: ['개발자'],
      section: '개발',
      tags: post.tags,
      images: post.image_url
        ? [
            {
              url: post.image_url,
              width: 1200,
              height: 630,
              alt: post.alt_text || post.title,
            },
          ]
        : [
            {
              url: `${siteUrl}/og-image.jpg`,
              width: 1200,
              height: 630,
              alt: '개발 블로그',
            },
          ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      creator: '@developer',
      images: post.image_url ? [post.image_url] : [`${siteUrl}/og-image.jpg`],
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
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const { data: post, error } = await blogApi.getPostBySlug(slug)

  if (error || !post) {
    notFound()
  }

  return <PostDetailPage post={post} />
}
