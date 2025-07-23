'use client'

import { useEffect, useState, useMemo, memo, Suspense } from 'react'
import { useTheme } from 'next-themes'
import { Post } from '@/types'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Share2, BookOpen, Heart } from 'lucide-react'
import MarkdownPreview from '@uiw/react-markdown-preview'
import rehypeHighlight from 'rehype-highlight'

interface PostDetailContentProps {
  post: Post
}

const PostDetailContentComponent = ({ post }: PostDetailContentProps) => {
  const { theme } = useTheme()
  const [isLiked, setIsLiked] = useState(false)
  const [likes, setLikes] = useState(0)
  const [isMarkdownError, setIsMarkdownError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 조회수 증가 (클라이언트 사이드, 페이지 로드 시 한 번만)
    const incrementViews = async () => {
      try {
        // post.id 유효성 검사
        if (!post?.id) {
          console.error('조회수 증가 실패: 유효하지 않은 post.id', { post });
          return;
        }
        
        // API 호출로 조회수 증가
        const response = await fetch(`/api/posts/${post.id}/views`, {
          method: 'POST',
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('조회수 증가 API 실패:', { error: errorData.error, postId: post.id });
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

  useEffect(() => {
    // 마크다운 로딩 시뮬레이션 및 에러 상태 초기화
    setIsLoading(true)
    setIsMarkdownError(false)
    
    const loadMarkdown = () => {
      try {
        // 간단한 로딩 지연 시뮬레이션
        setTimeout(() => {
          setIsLoading(false)
        }, 500)
      } catch (error) {
        console.error('마크다운 로딩 에러:', error)
        setIsMarkdownError(true)
        setIsLoading(false)
      }
    }

    loadMarkdown()
  }, [post.content])

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

  // 마크다운 렌더링 에러 처리 함수
  const handleMarkdownError = (error: Error) => {
    console.error('마크다운 렌더링 에러:', error)
    setIsMarkdownError(true)
  }

  // 로딩 컴포넌트
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-3 text-muted-foreground">콘텐츠를 불러오는 중...</span>
    </div>
  )

  // 에러 폴백 컴포넌트
  const ErrorFallback = () => (
    <div className="border border-destructive/20 bg-destructive/5 rounded-lg p-4">
      <h3 className="text-destructive font-medium mb-2">마크다운 렌더링 오류</h3>
      <p className="text-muted-foreground text-sm mb-3">
        콘텐츠를 렌더링하는 중 문제가 발생했습니다. 원본 텍스트를 표시합니다.
      </p>
      <div className="bg-muted p-3 rounded text-sm font-mono whitespace-pre-wrap">
        {post.content}
      </div>
    </div>
  )

  // 마크다운 옵션 메모이제이션
  const markdownOptions = useMemo(() => ({
    style: { 
      padding: 0, 
      backgroundColor: 'transparent'
    },
    className: "w-full overflow-hidden",
    'data-color-mode': theme === 'dark' ? 'dark' : 'light',
    rehypePlugins: [rehypeHighlight],
    skipHtml: false,
    rehypeRewrite: (node: any, index: number, parent: any) => {
      // Security and link handling with accessibility
      if (node.type === 'element' && node.tagName === 'a') {
        if (node.properties?.href && typeof node.properties.href === 'string') {
          const href = node.properties.href
          const isExternal = href.startsWith('http') && !href.includes(window?.location?.hostname || '')
          
          // Open external links in new tab with security
          if (isExternal) {
            node.properties.target = '_blank'
            node.properties.rel = 'noopener noreferrer'
            node.properties['aria-label'] = `${node.children?.[0]?.type === 'text' ? node.children[0].value : '링크'} (새 창에서 열림)`
          }
          
          // Add accessible description
          node.properties['aria-describedby'] = 'link-description'
        }
      }
      
      // Responsive image handling with accessibility
      if (node.type === 'element' && node.tagName === 'img') {
        node.properties = {
          ...node.properties,
          className: 'max-w-full h-auto rounded-lg shadow-sm',
          loading: 'lazy',
          'aria-describedby': node.properties?.alt ? 'img-description' : undefined
        }
        
        // Ensure alt text exists for accessibility
        if (!node.properties?.alt) {
          node.properties.alt = '블로그 포스트 이미지'
        }
      }
      
      // Code block accessibility and responsive handling
      if (node.type === 'element' && node.tagName === 'pre') {
        const codeElement = node.children?.find((child: any) => child.type === 'element' && child.tagName === 'code')
        const language = (codeElement as any)?.properties?.className?.[0]?.replace('language-', '') || '코드'
        
        node.properties = {
          ...node.properties,
          className: 'overflow-x-auto rounded-lg border',
          role: 'region',
          'aria-label': `${language} 코드 블록`,
          tabIndex: 0
        }
      }
      
      // Heading accessibility
      if (node.type === 'element' && ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node.tagName)) {
        node.properties = {
          ...node.properties,
          tabIndex: -1,
          id: `heading-${index}` // Allow linking to headings
        }
      }
      
      // Blockquote accessibility
      if (node.type === 'element' && node.tagName === 'blockquote') {
        node.properties = {
          ...node.properties,
          role: 'blockquote',
          'aria-label': '인용문'
        }
      }
      
      // List accessibility
      if (node.type === 'element' && (node.tagName === 'ul' || node.tagName === 'ol')) {
        node.properties = {
          ...node.properties,
          role: 'list'
        }
      }
      
      if (node.type === 'element' && node.tagName === 'li') {
        node.properties = {
          ...node.properties,
          role: 'listitem'
        }
      }
    }
  }), [theme])

  // 마크다운 렌더링 컴포넌트 (메모이제이션)
  const MarkdownRenderer = useMemo(() => {
    try {
      if (!post.content) {
        return (
          <div className="text-muted-foreground italic p-4">
            콘텐츠를 불러올 수 없습니다.
          </div>
        )
      }

      if (isMarkdownError) {
        return <ErrorFallback />
      }

      return (
        <MarkdownPreview
          source={post.content}
          {...markdownOptions}
        />
      )
    } catch (error) {
      handleMarkdownError(error as Error)
      return <ErrorFallback />
    }
  }, [post.content, markdownOptions, isMarkdownError])

  return (
    <div className="space-y-8">
      {/* 포스트 본문 */}
      <article 
        className="w-full prose prose-lg md:prose-xl max-w-none prose-slate dark:prose-invert"
        role="article"
        aria-label={`블로그 포스트: ${post.title}`}
        aria-describedby="post-content"
      >
        <div id="post-content">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <Suspense fallback={<LoadingSpinner />}>
              {MarkdownRenderer}
            </Suspense>
          )}
        </div>
      </article>

      {/* 접근성을 위한 숨겨진 설명 */}
      <div className="sr-only">
        <div id="link-description">
          이 링크는 추가 정보를 제공합니다. 외부 링크의 경우 새 창에서 열립니다.
        </div>
        <div id="img-description">
          이미지에 대한 자세한 설명입니다.
        </div>
      </div>

      <Separator className="my-8" />

      {/* 포스트 액션 버튼들 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant={isLiked ? 'default' : 'outline'}
            size="sm"
            onClick={toggleLike}
            className="flex items-center gap-2"
            aria-label={`이 포스트를 ${isLiked ? '좋아요 취소' : '좋아요'} (현재 ${likes}개)`}
            aria-pressed={isLiked}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likes}</span>
          </Button>

          <div 
            className="flex items-center gap-2 text-sm text-muted-foreground"
            role="status"
            aria-label="읽기 상태"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            <span>읽기 완료</span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="flex items-center gap-2"
          aria-label={`"${post.title}" 포스트 공유하기`}
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
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

// React.memo로 성능 최적화 - post 내용이 변경될 때만 리렌더링
export const PostDetailContent = memo(PostDetailContentComponent, (prevProps, nextProps) => {
  return (
    prevProps.post.id === nextProps.post.id &&
    prevProps.post.content === nextProps.post.content &&
    prevProps.post.title === nextProps.post.title &&
    prevProps.post.views === nextProps.post.views
  )
})
