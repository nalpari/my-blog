import { useState, useEffect, useCallback, useRef } from 'react'
import { useDebounce } from './useDebounce'
import { SearchResult } from '@/lib/search'

export interface SearchState {
  query: string
  results: SearchResult[]
  isLoading: boolean
  error: string | null
  total: number
  hasMore: boolean
  currentPage: number
}

export interface SearchOptions {
  limit?: number
  category?: string
  tags?: string[]
  initialQuery?: string
}

const SEARCH_DEBOUNCE_DELAY = 300 // 300ms 디바운스

/**
 * 실시간 검색 훅
 * @param options 검색 옵션
 * @returns 검색 상태와 검색 함수들
 */
export function useSearch(options: SearchOptions = {}) {
  const { limit = 10, category, tags, initialQuery = '' } = options
  
  const [searchState, setSearchState] = useState<SearchState>({
    query: initialQuery,
    results: [],
    isLoading: false,
    error: null,
    total: 0,
    hasMore: false,
    currentPage: 1
  })

  // AbortController 참조
  const abortControllerRef = useRef<AbortController | null>(null)

  // 검색어 디바운스
  const debouncedQuery = useDebounce(searchState.query, SEARCH_DEBOUNCE_DELAY)

  /**
   * 검색 API 호출 함수
   */
  const performSearch = useCallback(async (
    query: string, 
    page: number = 1, 
    append: boolean = false
  ) => {
    if (!query.trim()) {
      setSearchState(prev => ({
        ...prev,
        results: [],
        total: 0,
        hasMore: false,
        isLoading: false,
        error: null
      }))
      return
    }

    // 이전 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // 새로운 AbortController 생성
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      setSearchState(prev => ({
        ...prev,
        isLoading: true,
        error: null
      }))

      const offset = (page - 1) * limit
      const params = new URLSearchParams({
        q: query,
        limit: limit.toString(),
        offset: offset.toString()
      })

      if (category) {
        params.append('category', category)
      }

      if (tags && tags.length > 0) {
        params.append('tags', tags.join(','))
      }

      const response = await fetch(`/api/search?${params.toString()}`, {
        signal: abortController.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || '검색 중 오류가 발생했습니다.')
      }

      setSearchState(prev => ({
        ...prev,
        results: append ? [...prev.results, ...data.data.posts] : data.data.posts,
        total: data.data.pagination.total,
        hasMore: data.data.pagination.hasMore,
        currentPage: page,
        isLoading: false,
        error: null
      }))

    } catch (error) {
      // 요청이 취소된 경우 에러 처리하지 않음
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }

      console.error('Search error:', error)
      
      let errorMessage = '검색 중 오류가 발생했습니다.'
      
      if (error instanceof Error) {
        if (error.message.includes('429')) {
          errorMessage = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
        } else if (error.message.includes('503')) {
          errorMessage = '검색 서비스에 일시적인 문제가 발생했습니다.'
        } else if (error.message.includes('네트워크') || error.message.includes('Failed to fetch')) {
          errorMessage = '네트워크 연결을 확인해주세요.'
        } else if (error.message.includes('timeout')) {
          errorMessage = '요청 시간이 초과되었습니다. 다시 시도해주세요.'
        } else {
          errorMessage = error.message
        }
      }

      setSearchState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        results: append ? prev.results : []
      }))
    }
  }, [limit, category, tags])

  /**
   * 검색어 설정 함수
   */
  const setQuery = useCallback((query: string) => {
    setSearchState(prev => ({
      ...prev,
      query,
      currentPage: 1
    }))
  }, [])

  /**
   * 더 많은 결과 로드 (무한 스크롤용)
   */
  const loadMore = useCallback(() => {
    if (!searchState.isLoading && searchState.hasMore && debouncedQuery.trim()) {
      performSearch(debouncedQuery, searchState.currentPage + 1, true)
    }
  }, [searchState.isLoading, searchState.hasMore, searchState.currentPage, debouncedQuery, performSearch])

  /**
   * 검색 초기화
   */
  const clearSearch = useCallback(() => {
    setSearchState({
      query: '',
      results: [],
      isLoading: false,
      error: null,
      total: 0,
      hasMore: false,
      currentPage: 1
    })
  }, [])

  /**
   * 에러 초기화
   */
  const clearError = useCallback(() => {
    setSearchState(prev => ({
      ...prev,
      error: null
    }))
  }, [])

  // 디바운스된 검색어가 변경될 때 검색 실행
  useEffect(() => {
    if (debouncedQuery !== searchState.query) {
      return // 아직 디바운스 중
    }
    
    // 빈 검색어일 때는 API 호출하지 않음
    if (debouncedQuery.trim()) {
      performSearch(debouncedQuery)
    } else {
      // 빈 검색어일 때는 결과 초기화
      setSearchState(prev => ({
        ...prev,
        results: [],
        total: 0,
        hasMore: false,
        isLoading: false,
        error: null
      }))
    }
  }, [debouncedQuery, performSearch])

  // 컴포넌트 언마운트 시 진행 중인 요청 취소
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    // 상태
    query: searchState.query,
    results: searchState.results,
    isLoading: searchState.isLoading,
    error: searchState.error,
    total: searchState.total,
    hasMore: searchState.hasMore,
    currentPage: searchState.currentPage,
    
    // 액션
    setQuery,
    loadMore,
    clearSearch,
    clearError,
    
    // 유틸리티
    isEmpty: searchState.results.length === 0 && !searchState.isLoading && searchState.query.trim() !== '',
    hasResults: searchState.results.length > 0
  }
}