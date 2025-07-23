import React, { memo, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Tag, CalendarIcon, EyeIcon, UserIcon, TagIcon } from 'lucide-react';
import { highlightSearchTerms } from '@/lib/search';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: number;
  title: string;
  content: string;
  slug: string;
  published_at: Date | null;
  author: {
    name: string;
    avatar_url: string | null;
  };
  category: {
    name: string;
    slug: string;
    color: string | null;
  } | null;
  tags: string[];
  views: number;
  image_url: string | null;
  alt_text: string | null;
}

interface SearchResultsProps {
  results: SearchResult[];
  searchQuery: string;
  isLoading: boolean;
  error?: string;
  total?: number;
  hasMore?: boolean;
  onLoadMore?: () => void;
  selectedIndex?: number;
  onResultClick?: (result: SearchResult) => void;
}



// 로딩 스켈레톤 컴포넌트
const SearchResultSkeleton = memo(() => (
  <Card className="mb-4">
    <CardHeader>
      <div className="loading-skeleton h-6 rounded mb-2" />
      <div className="flex gap-2">
        <div className="loading-skeleton h-4 w-16 rounded" />
        <div className="loading-skeleton h-4 w-20 rounded" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <div className="loading-skeleton h-4 rounded" />
        <div className="loading-skeleton h-4 rounded w-3/4" />
      </div>
    </CardContent>
  </Card>
));
SearchResultSkeleton.displayName = 'SearchResultSkeleton';

// 검색 결과 없음 컴포넌트
const NoResults = memo(({ searchQuery }: { searchQuery: string }) => (
  <div className="text-center py-8" role="status" aria-live="polite">
    <div className="text-gray-500 dark:text-gray-400 mb-2">
      <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" aria-hidden="true" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
      검색 결과가 없습니다
    </h3>
    <p className="text-gray-500 dark:text-gray-400">
      '{searchQuery}'에 대한 검색 결과를 찾을 수 없습니다.
    </p>
    <p className="text-sm mt-1">다른 검색어를 시도해보세요.</p>
  </div>
));
NoResults.displayName = 'NoResults';

// 에러 컴포넌트
const ErrorMessage = memo(({ error }: { error: string }) => (
  <div className="error-message text-center py-8" role="alert" aria-live="assertive">
    <div className="text-red-500 mb-2">
      <Tag className="w-12 h-12 mx-auto mb-4" aria-hidden="true" />
    </div>
    <h3 className="text-lg font-medium text-red-900 dark:text-red-100 mb-2">
      검색 중 오류가 발생했습니다
    </h3>
    <p className="text-red-600 dark:text-red-400">
      {error}
    </p>
    <p className="text-sm mt-1">잠시 후 다시 시도해주세요.</p>
  </div>
));
ErrorMessage.displayName = 'ErrorMessage';

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  searchQuery,
  isLoading,
  error,
  total,
  hasMore,
  onLoadMore,
  selectedIndex = -1,
  onResultClick
}) => {
  // 로딩 스켈레톤 렌더링 최적화
  const loadingSkeletons = useMemo(() => {
    if (!isLoading || results.length > 0) return null;
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <SearchResultSkeleton key={index} />
        ))}
      </div>
    );
  }, [isLoading, results.length]);

  // 라우터 초기화
  const router = useRouter();

  // 검색 결과 렌더링 최적화
  const searchResultItems = useMemo(() => {
    return results.map((result, index) => {
      const isSelected = selectedIndex === index;
      
      const handleClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        if (onResultClick) {
          onResultClick(result);
        } else {
          router.push(`/blog/${result.slug}`);
        }
      }, [result, onResultClick, router]);
      
      return (
        <div
          key={result.id}
          id={`search-result-${index}`}
          data-result-index={index}
          className={cn(
            "search-result-item block smooth-transition hover-lift focus:outline-none cursor-pointer transition-all duration-200",
            isSelected ? "search-result-selected search-result-focus" : "hover:bg-muted/30",
            "focus-visible:search-result-focus"
          )}
          style={{
            animationDelay: `${index * 50}ms`
          }}
          onClick={handleClick}
          role="option"
          tabIndex={isSelected ? 0 : -1}
          aria-selected={isSelected}
          aria-label={`검색 결과: ${result.title} - ${result.author.name} 작성`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick(e as any);
            }
          }}
        >
          <Card className={cn(
            "smooth-transition cursor-pointer border-l-4 transform-gpu",
            "hover:shadow-lg hover:border-l-primary/60",
            isSelected 
              ? 'border-l-primary bg-primary/5 shadow-md ring-2 ring-primary/20' 
              : 'border-l-primary/40 hover:border-l-primary/60'
          )}>
          <CardHeader className="pb-3 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 mb-2 sm:mb-3">
              <span 
                dangerouslySetInnerHTML={{ __html: highlightSearchTerms(result.title, searchQuery) }} 
                aria-label={result.title}
              />
            </h3>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <Avatar className="w-4 h-4 sm:w-5 sm:h-5">
                  <AvatarImage src={result.author.avatar_url || ''} alt={`${result.author.name} 프로필 이미지`} />
                  <AvatarFallback>
                    <UserIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" aria-hidden="true" />
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{result.author.name}</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" aria-hidden="true" />
                <time dateTime={result.published_at?.toISOString()} className="truncate">
                  {result.published_at ? formatDistanceToNow(result.published_at, {
                    addSuffix: true,
                    locale: ko
                  }) : '날짜 없음'}
                </time>
              </div>
              
              <div className="flex items-center gap-1.5">
                <EyeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" aria-hidden="true" />
                <span aria-label={`조회수 ${result.views.toLocaleString()}회`}>{result.views.toLocaleString()}</span>
              </div>
              
              {result.category && (
                <Badge 
                  variant="secondary" 
                  className="text-xs w-fit"
                  style={{ backgroundColor: result.category.color || undefined }}
                >
                  {result.category.name}
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="pt-0 px-4 sm:px-6 pb-4 sm:pb-6">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 line-clamp-3 mb-3 sm:mb-4 leading-relaxed">
              <span 
                dangerouslySetInnerHTML={{ __html: highlightSearchTerms(result.content.slice(0, 150) + '...', searchQuery) }} 
                aria-label={`내용 미리보기: ${result.content.slice(0, 150)}...`}
              />
            </p>
            
            {result.tags && result.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {result.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs sm:text-sm py-1 px-2" aria-label={`태그: ${tag}`}>
                    <TagIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" aria-hidden="true" />
                    #{tag}
                  </Badge>
                ))}
                {result.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs sm:text-sm text-gray-500 py-1 px-2">
                    +{result.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
          </Card>
        </div>
      );
    });
  }, [results, searchQuery, selectedIndex, onResultClick]);

  // 로딩 상태
  if (loadingSkeletons) {
    return loadingSkeletons;
  }

  // 에러 상태
  if (error) {
    return <ErrorMessage error={error} />;
  }

  // 검색 결과 없음
  if (!results.length && searchQuery.trim()) {
    return <NoResults searchQuery={searchQuery} />;
  }

  // 검색어가 없는 경우
  if (!searchQuery.trim()) {
    return (
      <div className="text-center py-8" role="status">
        <div className="text-gray-500 dark:text-gray-400 mb-2">
          <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" aria-hidden="true" />
        </div>
        <p className="text-gray-500 dark:text-gray-400" aria-live="polite">
          검색어를 입력해주세요
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* 검색 결과 개수 표시 */}
      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 px-1" aria-live="polite">
        총 {total || results.length}개의 검색 결과
      </div>

      {/* 검색 결과 목록 */}
      <div 
        role="listbox" 
        aria-label="검색 결과 목록"
        aria-activedescendant={selectedIndex >= 0 ? `search-result-${selectedIndex}` : undefined}
      >
        {searchResultItems}
      </div>
      
      {/* 더 보기 버튼 */}
      {hasMore && onLoadMore && (
        <div className="text-center pt-4">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label={isLoading ? '검색 결과를 더 불러오는 중입니다' : '더 많은 검색 결과 보기'}
          >
            {isLoading ? '로딩 중...' : '더 보기'}
          </button>
        </div>
      )}
    </div>
  );
};

// SearchResults 컴포넌트를 memo로 감싸서 성능 최적화
const MemoizedSearchResults = memo(SearchResults);
MemoizedSearchResults.displayName = 'SearchResults';

export default MemoizedSearchResults;
export type { SearchResult, SearchResultsProps };