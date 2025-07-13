'use client'

import { useEffect, useState } from 'react'
import { Post } from '@/types'
import { blogApi } from '@/lib/prisma'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Share2, BookOpen, Heart } from 'lucide-react'

interface PostDetailContentProps {
  post: Post
}

export function PostDetailContent({ post }: PostDetailContentProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likes, setLikes] = useState(0)

  useEffect(() => {
    // 조회수 증가 (클라이언트 사이드, 페이지 로드 시 한 번만)
    const incrementViews = async () => {
      try {
        console.log('PostDetailContent에서 받은 post 데이터:', post);
        console.log('PostDetailContent에서 post.id 상세 정보:', { 
          id: post.id,
          idType: typeof post.id,
          idValue: String(post.id),
          isNull: post.id === null,
          isUndefined: post.id === undefined,
          isFalsy: !post.id
        });
        
        // post.id 유효성 검사
        if (!post?.id) {
          console.error('조회수 증가 실패: 유효하지 않은 post.id', { post });
          return;
        }

        console.log('조회수 증가 시도:', { postId: post.id, title: post.title });
        
        // posts 테이블의 views 컬럼 직접 업데이트
        const result = await blogApi.incrementViews(post.id);
        
        if (result.success) {
          console.log('조회수 증가 완료:', post.title);
        } else {
          console.error('조회수 증가 API 실패:', { error: result.error, postId: post.id });
        }
      } catch (error) {
        console.error('조회수 증가 예외 발생:', error);
      }
    };

    // 페이지 로드 시 조회수 증가 (약간의 지연을 두어 사용자가 실제로 페이지를 읽기 시작했을 때 카운트)
    const timer = setTimeout(() => {
      incrementViews();
    }, 1000); // 1초 후 조회수 증가

    // 컴포넌트 언마운트 시 타이머 정리
    return () => clearTimeout(timer);
  }, [post?.id, post?.title])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.content.slice(0, 160) + '...',
          url: window.location.href,
        })
      } catch (error) {
        console.error('공유 실패:', error)
      }
    } else {
      // 공유 API가 지원되지 않을 경우 URL 복사
      try {
        await navigator.clipboard.writeText(window.location.href)
        alert('링크가 복사되었습니다!')
      } catch (error) {
        console.error('복사 실패:', error)
      }
    }
  }

  const toggleLike = () => {
    setIsLiked(!isLiked)
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1))
  }

  return (
    <div className="space-y-8">
      {/* 포스트 본문 */}
      <article className="prose prose-lg max-w-none">
        <div className="leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>
      </article>

      <Separator className="my-8" />

      {/* 포스트 액션 버튼들 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant={isLiked ? 'default' : 'outline'}
            size="sm"
            onClick={toggleLike}
            className="flex items-center gap-2"
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likes}</span>
          </Button>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>읽기 완료</span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="flex items-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          <span>공유하기</span>
        </Button>
      </div>

      {/* 포스트 마지막 업데이트 정보 */}
      <div className="text-sm text-muted-foreground text-center pt-4 border-t">
        <p>
          이 포스트는{' '}
          {new Date(post.published_at || post.created_at).toLocaleDateString(
            'ko-KR',
            {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            },
          )}
          에 작성되었습니다.
        </p>
      </div>
    </div>
  )
}
