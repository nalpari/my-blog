'use client'

import Image from 'next/image'
import { Calendar, Clock, Eye, Tag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Post } from '@/types'

interface PostDetailHeaderProps {
  post: Post
}

export function PostDetailHeader({ post }: PostDetailHeaderProps) {
  // 날짜 포맷팅 (기존 BlogPostCard에서 재사용)
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // 읽기 시간 계산 (기존 BlogPostCard에서 재사용)
  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200
    const words = content.split(' ').length
    return Math.ceil(words / wordsPerMinute)
  }

  // 이미지 에러 처리 함수
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2NzUiIHZpZXdCb3g9IjAgMCAxMjAwIDY3NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjc1IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik01ODggMzI1TDYxMiAzMDFINjEyTDYzNiAzMjVMNjEyIDM0OUg2MTJMNTg4IDMyNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted/50 to-background">
      <div className="container mx-auto">
        <div className="max-w-5xl mx-auto">
          {/* 포스트 이미지 */}
          {post.image_url && (
            <div className="aspect-video mb-8 rounded-lg overflow-hidden shadow-lg">
              <Image
                src={post.image_url}
                alt={post.alt_text || post.title}
                width={1200}
                height={675}
                className="w-full h-full object-cover"
                priority
                onError={handleImageError}
                quality={85}
              />
            </div>
          )}

          {/* 포스트 메타데이터 */}
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text leading-tight">
              {post.title}
            </h1>
            
            {/* 메타데이터 아이콘들 */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">
                  {formatDate(post.published_at || post.created_at)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">
                  {calculateReadTime(post.content)}분 읽기
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span className="text-sm">
                  {post.views.toLocaleString()} 조회
                </span>
              </div>
            </div>

            {/* 태그 */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {post.tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="tag hover:bg-primary/20 transition-colors"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
} 