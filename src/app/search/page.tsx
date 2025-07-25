'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SearchInput } from '@/components/custom/search-input'
import { SearchResults } from '@/components/custom/search-results'
import { useSearch } from '@/hooks/useSearch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Clock, Search as SearchIcon } from 'lucide-react'

// SearchContent 컴포넌트로 분리하여 Suspense로 감싸기 위한 컴포넌트
function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') || ''
  
  const {
    query,
    results,
    isLoading,
    error,
    total,
    hasMore,
    setQuery,
    loadMore,
    clearSearch,
    clearError
  } = useSearch({
    initialQuery,
    limit: 10
  })

  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [showWelcome, setShowWelcome] = useState(true)

  // 로컬 스토리지에서 최근 검색어 로드
  useEffect(() => {
    try {
      const saved = localStorage.getItem('recent-searches')
      if (saved) {
        setRecentSearches(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error)
    }
  }, [])

  // URL 쿼리 파라미터와 동기화
  useEffect(() => {
    const urlQuery = searchParams.get('q') || ''
    if (urlQuery !== query) {
      setQuery(urlQuery)
    }
  }, [searchParams, query, setQuery])

  // 검색어가 있으면 환영 메시지 숨기기
  useEffect(() => {
    if (query.trim() || results.length > 0) {
      setShowWelcome(false)
    } else {
      setShowWelcome(true)
    }
  }, [query, results.length])

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      router.push('/search')
      return
    }

    // URL 업데이트
    const params = new URLSearchParams()
    params.set('q', searchQuery)
    router.push(`/search?${params.toString()}`)

    // 최근 검색어에 추가
    const updatedRecent = [
      searchQuery,
      ...recentSearches.filter(s => s !== searchQuery)
    ].slice(0, 10)
    
    setRecentSearches(updatedRecent)
    
    try {
      localStorage.setItem('recent-searches', JSON.stringify(updatedRecent))
    } catch (error) {
      console.error('Failed to save recent searches:', error)
    }

    setQuery(searchQuery)
  }

  const handleClear = () => {
    router.push('/search')
    clearSearch()
  }

  const handleRecentSearchClick = (searchTerm: string) => {
    handleSearch(searchTerm)
  }

  const handlePopularSearchClick = (searchTerm: string) => {
    handleSearch(searchTerm)
  }

  // 인기 검색어를 API에서 가져오기
  const [popularSearches, setPopularSearches] = useState<string[]>([])
  const [isLoadingPopular, setIsLoadingPopular] = useState(false)
  
  useEffect(() => {
    const fetchPopularSearches = async () => {
      setIsLoadingPopular(true)
      try {
        const response = await fetch('/api/search/popular?limit=12')
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setPopularSearches(result.data)
          }
        } else {
          console.error('인기 검색어 API 호출 실패')
        }
      } catch (error) {
        console.error('인기 검색어 로딩 실패:', error)
      } finally {
        setIsLoadingPopular(false)
      }
    }
    
    fetchPopularSearches()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 페이지 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <SearchIcon className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              블로그 검색
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            원하는 주제의 블로그 포스트를 빠르게 찾아보세요. 제목, 내용, 태그를 모두 검색할 수 있습니다.
          </p>
        </div>

        {/* 검색 입력 */}
        <div className="mb-8">
          <SearchInput
            value={query}
            onChange={setQuery}
            onClear={handleClear}
            placeholder="검색어를 입력하세요..."
            isLoading={isLoading}
            recentSearches={recentSearches}
            popularSearches={popularSearches}
            showSuggestions={true}
            onSuggestionClick={handleSearch}
            className="max-w-2xl mx-auto"
          />
        </div>

        {/* 환영 메시지 및 추천 검색어 */}
        {showWelcome && (
          <div className="space-y-6">
            {/* 최근 검색어 */}
            {recentSearches.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <span>최근 검색어</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.slice(0, 8).map((search, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-200"
                        onClick={() => handleRecentSearchClick(search)}
                      >
                        {search}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 인기 검색어 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-gray-500" />
                  <span>인기 검색어</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((search, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-300 dark:hover:border-blue-700 transition-colors duration-200"
                      onClick={() => handlePopularSearchClick(search)}
                    >
                      {search}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 검색 팁 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">검색 팁</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-start space-x-2">
                    <span className="font-medium text-blue-600 dark:text-blue-400">•</span>
                    <span>여러 단어로 검색하면 더 정확한 결과를 얻을 수 있습니다</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="font-medium text-blue-600 dark:text-blue-400">•</span>
                    <span>제목, 내용, 태그, 카테고리에서 모두 검색됩니다</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="font-medium text-blue-600 dark:text-blue-400">•</span>
                    <span>검색 결과는 관련도 순으로 정렬됩니다</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 검색 결과 */}
        {!showWelcome && (
          <SearchResults
            results={results}
            query={query}
            isLoading={isLoading}
            error={error}
            total={total}
            hasMore={hasMore}
            onLoadMore={loadMore}
            onClearError={clearError}
          />
        )}
      </div>
    </div>
  )
}

/**
 * 검색 페이지 메인 컴포넌트
 */
export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">검색 페이지 로딩 중...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}