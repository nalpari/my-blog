'use client'

import { useEffect, useState, useRef, useCallback, useMemo, memo } from 'react'
import { createPortal } from 'react-dom'
import FocusTrap from 'focus-trap-react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSearch } from '@/hooks/useSearch'
import SearchResults from '@/components/search/SearchResults'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  initialQuery?: string
}

const SearchModalComponent = ({ isOpen, onClose, initialQuery = '' }: SearchModalProps) => {
  const [mounted, setMounted] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  
  // 검색 훅 사용
  const {
    query: searchQuery,
    results,
    isLoading,
    error,
    setQuery: setSearchQuery
  } = useSearch({ initialQuery })

  // 컴포넌트 마운트 상태 관리
  useEffect(() => {
    setMounted(true)
  }, [])

  // 검색 결과가 변경될 때 선택된 인덱스 초기화
  useEffect(() => {
    setSelectedIndex(-1)
  }, [results])

  // 선택된 항목이 화면에 보이도록 자동 스크롤
  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const selectedElement = resultsRef.current.querySelector(`[data-result-index="${selectedIndex}"]`)
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        })
      }
    }
  }, [selectedIndex])

  // 모달이 열릴 때 검색창에 자동 포커스 (FocusTrap이 처리하므로 제거)
  // useEffect(() => {
  //   if (isOpen && searchInputRef.current) {
  //     const timer = setTimeout(() => {
  //       searchInputRef.current?.focus()
  //     }, 100)
  //     return () => clearTimeout(timer)
  //   }
  // }, [isOpen])

  // 키보드 네비게이션 및 ESC 키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return

      switch (event.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowDown':
          event.preventDefault()
          setSelectedIndex(prev => {
            const maxIndex = results.length - 1
            return prev < maxIndex ? prev + 1 : prev
          })
          break
        case 'ArrowUp':
          event.preventDefault()
          setSelectedIndex(prev => prev > -1 ? prev - 1 : -1)
          break
        case 'Enter':
          event.preventDefault()
          if (selectedIndex >= 0 && selectedIndex < results.length) {
            const selectedResult = results[selectedIndex]
            // 페이지 이동
            window.location.href = `/blog/${selectedResult.slug}`
          }
          break
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // 모달이 열릴 때 body 스크롤 방지
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose, selectedIndex, results])

  // 배경 클릭으로 모달 닫기
  const handleBackgroundClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }, [onClose])

  // 검색 처리 (실시간 검색이므로 form submit은 기본 동작만)
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    // 실시간 검색이므로 별도 처리 불필요
  }, [])

  // 검색 결과 클릭 핸들러
  const handleResultClick = useCallback((result: any) => {
    onClose()
    // 페이지 이동 로직 (Next.js router 사용)
    window.location.href = `/posts/${result.slug}`
  }, [onClose])

  // 서버 사이드 렌더링 방지
  if (!mounted) {
    return null
  }

  // 모달이 닫혀있으면 렌더링하지 않음
  if (!isOpen) {
    return null
  }

  const modalContent = (
    <FocusTrap
      active={isOpen}
      focusTrapOptions={{
        initialFocus: () => searchInputRef.current,
        allowOutsideClick: true,
        clickOutsideDeactivates: true,
        escapeDeactivates: false, // ESC 키는 직접 처리
        returnFocusOnDeactivate: true
      }}
    >
      <div
        className={cn(
          "modal-backdrop flex items-start justify-center",
          "pt-4 sm:pt-[10vh] px-4 sm:px-0"
        )}
        onClick={handleBackgroundClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-modal-title"
        aria-describedby="search-modal-description"
      >
      <div
        ref={modalRef}
        className={cn(
          "modal-content transform-gpu will-change-transform flex flex-col"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b">
          <h2 id="search-modal-title" className="text-base sm:text-lg font-semibold">검색</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 sm:h-9 sm:w-9"
            aria-label="검색 모달 닫기"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">닫기</span>
          </Button>
        </div>

        {/* 검색 입력 영역 */}
        <div className="p-4 sm:p-6">
          <p id="search-modal-description" className="sr-only">
            검색어를 입력하여 블로그 포스트를 찾을 수 있습니다. 방향키로 결과를 탐색하고 엔터키로 선택할 수 있습니다.
          </p>
          <form onSubmit={handleSearch} className="space-y-3 sm:space-y-4" role="search">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              <Input
                ref={searchInputRef}
                type="search"
                placeholder="검색어를 입력하세요..."
                className={cn(
                  "w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 text-base sm:text-lg transition-all duration-200",
                  "focus-visible:search-input-focus"
                )}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="블로그 포스트 검색"
                aria-describedby="search-status"
                autoComplete="off"
                spellCheck="false"
              />
            </div>
            
            {/* 검색 버튼 (모바일에서는 숨김) */}
            <div className="hidden sm:flex justify-end">
              <Button 
                type="submit" 
                disabled={!searchQuery.trim()}
                aria-label="검색 실행"
              >
                검색
              </Button>
            </div>
          </form>
        </div>

        {/* 검색 결과 영역 */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 flex-1 overflow-hidden">
          {/* 검색 상태 알림 (스크린 리더용) */}
          <div id="search-status" className="sr-only" aria-live="polite" aria-atomic="true">
            {isLoading && '검색 중입니다...'}
            {!isLoading && results.length > 0 && `${results.length}개의 검색 결과가 있습니다.`}
            {!isLoading && results.length === 0 && searchQuery.trim() && '검색 결과가 없습니다.'}
            {error && `검색 중 오류가 발생했습니다: ${error}`}
          </div>
          
          <div 
            ref={resultsRef} 
            className={cn(
              "h-full max-h-[50vh] sm:max-h-96 overflow-y-auto",
              "transition-all duration-300 ease-out",
              searchQuery ? "animate-in slide-in-from-bottom-2 fade-in-0 duration-400" : ""
            )}
            role="region"
            aria-label="검색 결과"
          >
            <SearchResults 
              results={results}
              searchQuery={searchQuery}
              isLoading={isLoading}
              error={error || undefined}
              selectedIndex={selectedIndex}
              onResultClick={handleResultClick}
            />
          </div>
        </div>
      </div>
    </div>
    </FocusTrap>
  )

  // Portal을 사용하여 body에 모달 렌더링
  return createPortal(modalContent, document.body)
}

// React.memo로 불필요한 리렌더링 방지
export const SearchModal = memo(SearchModalComponent)
export default SearchModal