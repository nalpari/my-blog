'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Search, X, Clock, TrendingUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  placeholder?: string
  isLoading?: boolean
  suggestions?: string[]
  recentSearches?: string[]
  popularSearches?: string[]
  showSuggestions?: boolean
  onSuggestionClick?: (suggestion: string) => void
  className?: string
}

/**
 * 검색 제안 드롭다운 컴포넌트
 */
function SearchSuggestions({
  suggestions = [],
  recentSearches = [],
  popularSearches = [],
  query,
  onSuggestionClick,
  onClose
}: {
  suggestions: string[]
  recentSearches: string[]
  popularSearches: string[]
  query: string
  onSuggestionClick?: (suggestion: string) => void
  onClose: () => void
}) {
  const hasContent = suggestions.length > 0 || recentSearches.length > 0 || popularSearches.length > 0
  
  if (!hasContent) return null

  const handleSuggestionClick = (suggestion: string) => {
    onSuggestionClick?.(suggestion)
    onClose()
  }

  return (
    <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto shadow-lg border">
      <CardContent className="p-0">
        {/* 검색 제안 */}
        {suggestions.length > 0 && (
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">
              검색 제안
            </div>
            {suggestions.map((suggestion, index) => (
              <button
                key={`suggestion-${index}`}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors duration-150 flex items-center space-x-2"
              >
                <Search className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{suggestion}</span>
              </button>
            ))}
          </div>
        )}

        {/* 최근 검색어 */}
        {recentSearches.length > 0 && (
          <div className="p-2 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2 flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>최근 검색어</span>
            </div>
            {recentSearches.slice(0, 5).map((search, index) => (
              <button
                key={`recent-${index}`}
                onClick={() => handleSuggestionClick(search)}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors duration-150 flex items-center space-x-2"
              >
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{search}</span>
              </button>
            ))}
          </div>
        )}

        {/* 인기 검색어 */}
        {popularSearches.length > 0 && (
          <div className="p-2 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2 flex items-center space-x-1">
              <TrendingUp className="h-3 w-3" />
              <span>인기 검색어</span>
            </div>
            <div className="flex flex-wrap gap-1 px-2">
              {popularSearches.slice(0, 8).map((search, index) => (
                <Badge
                  key={`popular-${index}`}
                  variant="secondary"
                  className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-150 text-xs"
                  onClick={() => handleSuggestionClick(search)}
                >
                  {search}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * 검색 입력 메인 컴포넌트
 */
export function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = "블로그 포스트 검색...",
  isLoading = false,
  suggestions = [],
  recentSearches = [],
  popularSearches = [],
  showSuggestions = false,
  onSuggestionClick,
  className
}: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
        setIsFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // ESC 키로 드롭다운 닫기
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowDropdown(false)
        setIsFocused(false)
        inputRef.current?.blur()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    
    // 입력이 있을 때만 제안 표시
    if (newValue.trim() && showSuggestions) {
      setShowDropdown(true)
    } else {
      setShowDropdown(false)
    }
  }

  const handleInputFocus = () => {
    setIsFocused(true)
    // 포커스 시 최근 검색어나 인기 검색어가 있으면 드롭다운 표시
    if (recentSearches.length > 0 || popularSearches.length > 0) {
      setShowDropdown(true)
    }
  }

  const handleClear = () => {
    onClear()
    setShowDropdown(false)
    inputRef.current?.focus()
  }

  const handleSuggestionSelect = (suggestion: string) => {
    onChange(suggestion)
    onSuggestionClick?.(suggestion)
    setShowDropdown(false)
    inputRef.current?.blur()
  }

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        {/* 검색 아이콘 */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {isLoading ? (
            <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </div>

        {/* 입력 필드 */}
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className={cn(
            "pl-10 pr-10 h-12 text-base",
            isFocused && "ring-2 ring-blue-500 border-blue-500"
          )}
          autoComplete="off"
          spellCheck={false}
        />

        {/* 클리어 버튼 */}
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* 검색 제안 드롭다운 */}
      {showDropdown && (
        <SearchSuggestions
          suggestions={suggestions}
          recentSearches={recentSearches}
          popularSearches={popularSearches}
          query={value}
          onSuggestionClick={handleSuggestionSelect}
          onClose={() => setShowDropdown(false)}
        />
      )}
    </div>
  )
}

/**
 * 검색 바 래퍼 컴포넌트 (헤더나 페이지에서 사용)
 */
export function SearchBar({
  onSearch,
  className
}: {
  onSearch?: (query: string) => void
  className?: string
}) {
  const [query, setQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  
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

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return
    
    // 최근 검색어에 추가
    const updatedRecent = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 10)
    setRecentSearches(updatedRecent)
    
    try {
      localStorage.setItem('recent-searches', JSON.stringify(updatedRecent))
    } catch (error) {
      console.error('Failed to save recent searches:', error)
    }
    
    onSearch?.(searchQuery)
  }

  const handleClear = () => {
    setQuery('')
  }

  // 인기 검색어 (실제로는 API에서 가져와야 함)
  const popularSearches = [
    'React', 'Next.js', 'TypeScript', 'JavaScript', 
    'CSS', 'Node.js', 'Python', 'AI'
  ]

  return (
    <SearchInput
      value={query}
      onChange={setQuery}
      onClear={handleClear}
      recentSearches={recentSearches}
      popularSearches={popularSearches}
      showSuggestions={true}
      onSuggestionClick={handleSearch}
      className={className}
    />
  )
}