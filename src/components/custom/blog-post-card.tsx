'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Eye, User } from 'lucide-react'
import { Post } from '@/types'

interface BlogPostCardProps {
  post: Post
  showAuthor?: boolean
  showViews?: boolean
  compact?: boolean
}

export const BlogPostCard = ({
  post,
  showAuthor = true,
  showViews = true,
  compact = false,
}: BlogPostCardProps) => {
  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // 읽기 시간 계산 (대략적)
  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200
    const words = content.split(' ').length
    const minutes = Math.ceil(words / wordsPerMinute)
    return minutes
  }

  // 콘텐츠 미리보기 생성
  const getPreview = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  // 이미지 에러 처리 함수
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = '/images/placeholder-blog.svg'
  }

  // 조회수 업데이트 핸들러
  const handlePostClick = async () => {
    try {
      const { incrementViews } = await import('@/lib/prisma').then(module => module.blogApi)
      const result = await incrementViews(post.id)
      if (result.success) {
        console.log('조회수 업데이트 성공:', post.id)
      } else {
        console.error('조회수 업데이트 실패:', result.error)
      }
    } catch (error) {
      console.error('조회수 업데이트 중 에러:', error)
    }
  }

  // blur placeholder 데이터 (작은 gray 이미지)
  const blurDataURL =
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxAAPwCdABmX/9k='

  if (compact) {
    return (
      <Card className="blog-card group cursor-pointer">
        <Link href={`/blog/${post.slug}`} className="block" onClick={handlePostClick}>
          <div className="flex gap-3 p-4">
            {/* 좌측 작은 이미지 영역 */}
            {post.image_url && (
              <div className="flex-shrink-0 w-16 h-16 overflow-hidden rounded-md">
                <Image
                  src={post.image_url}
                  alt={post.alt_text || post.title}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL={blurDataURL}
                  onError={handleImageError}
                  quality={75}
                  priority={false}
                />
              </div>
            )}

            {/* 우측 텍스트 컨텐츠 */}
            <div className="flex-1 space-y-2">
              <h3 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {formatDate(post.published_at || post.created_at)}
                  </span>
                </div>
                {showViews && (
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{(post.views || 0).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Link>
      </Card>
    )
  }

  // 포스트 데이터 로깅
  console.log('BlogPostCard 렌더링:', { 
    id: post.id, 
    title: post.title,
    slug: post.slug
  });

  return (
    <Card className="blog-card group cursor-pointer">
      <Link href={`/blog/${post.slug}`} className="block" onClick={handlePostClick}>
        {/* 일반 모드용 이미지 영역 */}
        {post.image_url && (
          <div className="aspect-video overflow-hidden rounded-t-lg mb-3">
            <Image
              src={post.image_url}
              alt={post.alt_text || post.title}
              width={400}
              height={225}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              placeholder="blur"
              blurDataURL={blurDataURL}
              onError={handleImageError}
              quality={75}
              priority={false}
            />
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.published_at || post.created_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{calculateReadTime(post.content)}분</span>
              </div>
              {showViews && (
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{(post.views || 0).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          <h3 className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>

          {showAuthor && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>작성자</span>
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-0">
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {getPreview(post.content)}
          </p>

          {/* 태그 */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs tag">
                  {tag}
                </Badge>
              ))}
              {post.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{post.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  )
}
