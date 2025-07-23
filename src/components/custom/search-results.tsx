'use client'

import React from 'react'
import Link from 'next/link'
import { SearchResult } from '@/lib/search'
import { highlightSearchTerms } from '@/lib/search'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CalendarIcon, EyeIcon, UserIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ClientDate } from './client-date'

interface SearchResultsProps {
  results: SearchResult[]
  query: string
  isLoading: boolean
  error: string | null
  total: number
  hasMore: boolean
  onLoadMore?: () => void
  onClearError?: () => void
  className?: string
}

/**
 * 검색 결과 스켈레톤 컴포넌트
 */
function SearchResultSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="space-y-2">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="flex items-center space-x-2">
          <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
        <div className="flex space-x-2 mt-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * 개별 검색 결과 아이템 컴포넌트
 */
function SearchResultItem({ result, query }: { result: SearchResult; query: string }) {
  // 날짜 포맷팅은 ClientDate 컴포넌트로 대체

  const getExcerpt = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <Link 
          href={`/blog/${result.slug}`}
          className="group"
        >
          <h3 
            className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 line-clamp-2"
            dangerouslySetInnerHTML={{
              __html: highlightSearchTerms(result.title, query)
            }}
          />
        </Link>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Avatar className="h-5 w-5">
              <AvatarImage src={result.author.avatar_url || ''} alt={result.author.name} />
              <AvatarFallback className="text-xs">
                <UserIcon className="h-3 w-3" />
              </AvatarFallback>
            </Avatar>
            <span>{result.author.name}</span>
          </div>
          
          {result.published_at && (
            <div className="flex items-center space-x-1">
              <CalendarIcon className="h-4 w-4" />
              <span><ClientDate date={result.published_at} format="long" /></span>
            </div>
          )}
          
          <div className="flex items-center space-x-1">
            <EyeIcon className="h-4 w-4" />
            <span>{result.views.toLocaleString()}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p 
          className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3"
          dangerouslySetInnerHTML={{
            __html: highlightSearchTerms(getExcerpt(result.content), query)
          }}
        />
        
        <div className="flex flex-wrap gap-2">
          {result.category && (
            <Badge 
              variant="secondary" 
              className="text-xs"
              style={{ backgroundColor: result.category.color || '#6366f1' }}
            >
              {result.category.name}
            </Badge>
          )}
          
          {result.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          
          {result.tags.length > 3 && (
            <Badge variant="outline" className="text-xs text-gray-500">
              +{result.tags.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * 검색 결과 메인 컴포넌트
 */
export function SearchResults({
  results,
  query,
  isLoading,
  error,
  total,
  hasMore,
  onLoadMore,
  onClearError,
  className
}: SearchResultsProps) {
  // 에러 상태
  if (error) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="text-center py-8">
          <div className="text-red-600 dark:text-red-400 mb-4">
            <svg className="mx-auto h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-medium">검색 중 오류가 발생했습니다</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
          {onClearError && (
            <button
              onClick={onClearError}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              다시 시도
            </button>
          )}
        </div>
      </div>
    )
  }

  // 로딩 상태 (초기 로딩)
  if (isLoading && results.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          검색 중...
        </div>
        {Array.from({ length: 3 }).map((_, index) => (
          <SearchResultSkeleton key={index} />
        ))}
      </div>
    )
  }

  // 검색어가 있지만 결과가 없는 경우
  if (query.trim() && results.length === 0 && !isLoading) {
    return (
      <div className={cn("text-center py-8", className)}>
        <div className="text-gray-500 dark:text-gray-400">
          <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-lg font-medium mb-2">검색 결과가 없습니다</h3>
          <p className="text-sm">
            '<span className="font-medium">{query}</span>'에 대한 검색 결과를 찾을 수 없습니다.
          </p>
          <p className="text-sm mt-1">다른 검색어를 시도해보세요.</p>
        </div>
      </div>
    )
  }

  // 검색 결과 표시
  return (
    <div className={cn("space-y-4", className)}>
      {/* 검색 결과 요약 */}
      {query.trim() && results.length > 0 && (
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          '<span className="font-medium">{query}</span>'에 대한 검색 결과 {total.toLocaleString()}개
        </div>
      )}

      {/* 검색 결과 목록 */}
      <div className="space-y-4">
        {results.map((result) => (
          <SearchResultItem 
            key={result.id} 
            result={result} 
            query={query} 
          />
        ))}
      </div>

      {/* 더 보기 버튼 */}
      {hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? '로딩 중...' : '더 보기'}
          </button>
        </div>
      )}

      {/* 추가 로딩 스켈레톤 (더 보기 로딩 시) */}
      {isLoading && results.length > 0 && (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <SearchResultSkeleton key={`loading-${index}`} />
          ))}
        </div>
      )}
    </div>
  )
}