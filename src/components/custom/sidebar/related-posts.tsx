'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BlogPostCard } from '../blog-post-card'
import { Post } from '@/types'
import { Heart } from 'lucide-react'

interface RelatedPostsProps {
  currentPost: Post
}

export function RelatedPosts({ currentPost }: RelatedPostsProps) {
  // 임시 관련 포스트 데이터 (실제로는 태그 기반으로 필터링)
  const mockRelatedPosts: Post[] = [
    {
      id: '2',
      title: 'Tailwind CSS와 shadcn/ui로 아름다운 UI 만들기',
      content: 'Tailwind CSS의 utility-first 접근법과 shadcn/ui의 재사용 가능한 컴포넌트들을 조합해서 모던하고 아름다운 사용자 인터페이스를 만드는 방법을 알아보겠습니다.',
      slug: 'tailwind-shadcn-ui-guide',
      author_id: 'user-1',
      created_at: '2024-01-12T09:00:00Z',
      published_at: '2024-01-12T09:00:00Z',
      is_published: true,
      tags: ['Tailwind CSS', 'shadcn/ui', 'UI/UX', '디자인'],
      views: 987,
      image_url: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&h=450&fit=crop',
      alt_text: 'UI 디자인과 컬러 팔레트가 표시된 디자인 작업 환경',
    },
    {
      id: '5',
      title: 'TypeScript 고급 타입 활용법',
      content: 'TypeScript의 고급 타입 기능들을 활용해서 더 안전하고 표현력 있는 코드를 작성하는 방법을 알아보겠습니다. 제네릭, 유니온 타입, 조건부 타입 등을 다룹니다.',
      slug: 'typescript-advanced-types',
      author_id: 'user-1',
      created_at: '2024-01-05T06:00:00Z',
      published_at: '2024-01-05T06:00:00Z',
      is_published: true,
      tags: ['TypeScript', '고급타입', '개발'],
      views: 673,
      image_url: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=450&fit=crop',
      alt_text: 'TypeScript 코드와 타입 정의가 표시된 코드 에디터',
    },
    {
      id: '4',
      title: 'React 성능 최적화 완벽 가이드',
      content: 'React 애플리케이션의 성능을 최적화하는 다양한 방법들을 소개합니다. 메모이제이션, 코드 스플리팅, 레이지 로딩 등 실무에서 바로 적용할 수 있는 기법들을 다룹니다.',
      slug: 'react-performance-optimization',
      author_id: 'user-1',
      created_at: '2024-01-08T07:00:00Z',
      published_at: '2024-01-08T07:00:00Z',
      is_published: true,
      tags: ['React', '성능최적화', '프론트엔드'],
      views: 892,
      // 이미지 없이 두어서 이미지가 없는 경우 테스트
    },
    {
      id: '3',
      title: 'Supabase로 풀스택 앱 개발하기',
      content: 'Supabase를 사용해서 인증, 데이터베이스, 스토리지 등 백엔드 기능들을 쉽게 구현하는 방법을 살펴보겠습니다. PostgreSQL과 Real-time 기능까지 활용해보세요.',
      slug: 'supabase-fullstack-development',
      author_id: 'user-1',
      created_at: '2024-01-10T08:00:00Z',
      published_at: '2024-01-10T08:00:00Z',
      is_published: true,
      tags: ['Supabase', 'PostgreSQL', '풀스택', '백엔드'],
      views: 756,
      image_url: 'https://images.unsplash.com/photo-1544077960-604201fe74bc?w=800&h=450&fit=crop',
      alt_text: '데이터베이스 스키마와 서버 아키텍처 다이어그램',
    },
  ].filter(post => post.id !== currentPost.id) // 현재 포스트 제외

  // 현재 포스트 태그와 겹치는 포스트를 우선 표시 (간단한 태그 기반 필터링)
  const relatedPosts = mockRelatedPosts
    .map(post => ({
      ...post,
      relevanceScore: post.tags.filter(tag => currentPost.tags.includes(tag)).length
    }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 3) // 최대 3개만 표시

  if (relatedPosts.length === 0) {
    return null // 관련 포스트가 없으면 컴포넌트 숨김
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          Related Posts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {relatedPosts.map((post) => (
          <BlogPostCard
            key={post.id}
            post={post}
            compact={true}
            showAuthor={false}
            showViews={false}
          />
        ))}
      </CardContent>
    </Card>
  )
} 