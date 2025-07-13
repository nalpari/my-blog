'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu'
import { Input } from '@/components/ui/input'
import { Search, Menu, Sun, Moon, Settings } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Category } from '@/types'

interface BlogHeaderProps {
  siteTitle?: string
}

// 컴포넌트 외부로 이동해서 재생성 방지
const CATEGORY_ORDER = ['tech', 'lifestyle', 'review', 'tutorial']

export const BlogHeader = ({ siteTitle = 'My Blog' }: BlogHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mounted, setMounted] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  // 카테고리 데이터 가져오기
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const categoriesData = await response.json()
          
          // 원하는 순서대로 정렬
          const sortedCategories = categoriesData.sort((a: Category, b: Category) => {
            const aIndex = CATEGORY_ORDER.indexOf(a.slug)
            const bIndex = CATEGORY_ORDER.indexOf(b.slug)
            
            // 순서에 없는 카테고리는 뒤로
            if (aIndex === -1 && bIndex === -1) return 0
            if (aIndex === -1) return 1
            if (bIndex === -1) return -1
            
            return aIndex - bIndex
          })
          
          setCategories(sortedCategories)
        }
      } catch (error) {
        console.error('헤더 카테고리 로딩 실패:', error)
      }
    }

    if (mounted) {
      fetchCategories()
    }
  }, [mounted])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // 검색 기능 구현
      console.log('검색:', searchQuery)
    }
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  if (!mounted) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* 로고 */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <span className="text-sm font-bold">B</span>
            </div>
            <span className="text-xl font-bold gradient-text">{siteTitle}</span>
          </Link>

          {/* 네비게이션 메뉴 - 데스크톱 */}
          <nav className="hidden md:flex items-center space-x-6">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link
                    href="/"
                    className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    홈
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link
                    href="/blog"
                    className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    블로그
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium">
                    카테고리
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-64 p-4">
                      <div className="space-y-2">
                        {categories.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground">
                            카테고리 로딩중...
                          </div>
                        ) : (
                          categories.map((category) => (
                            <Link
                              key={category.id}
                              href={`/blog/category/${category.slug}`}
                              className="flex items-center justify-between p-2 hover:bg-accent rounded-md transition-colors"
                            >
                              <span className="text-sm font-medium">
                                {category.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ({category.post_count || 0})
                              </span>
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link
                    href="/about"
                    className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    소개
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>

          {/* 검색 및 유틸리티 */}
          <div className="flex items-center space-x-4">
            {/* 검색 폼 */}
            <form
              onSubmit={handleSearch}
              className="hidden sm:flex items-center space-x-2"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="search"
                  placeholder="검색..."
                  className="w-64 pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>

            {/* 다크 모드 토글 */}
            <Button variant="ghost" size="icon" className="hidden sm:flex" onClick={toggleTheme}>
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">테마 변경</span>
            </Button>

            {/* 관리자 버튼 */}
            <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
              <Link href="/admin">
                <Settings className="h-4 w-4" />
                <span className="sr-only">관리자</span>
              </Link>
            </Button>

            {/* 모바일 메뉴 버튼 */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-4 w-4" />
              <span className="sr-only">메뉴 열기</span>
            </Button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <nav className="space-y-2">
              <Link
                href="/"
                className="block py-2 text-sm font-medium text-foreground hover:text-primary"
              >
                홈
              </Link>
              <Link
                href="/blog"
                className="block py-2 text-sm font-medium text-foreground hover:text-primary"
              >
                블로그
              </Link>
              
              {/* 모바일 카테고리 */}
              <div className="space-y-1">
                <div className="py-2 text-sm font-medium text-foreground">
                  카테고리
                </div>
                <div className="pl-4 space-y-1">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/blog/category/${category.slug}`}
                      className="flex items-center justify-between py-1 text-sm text-muted-foreground hover:text-primary"
                    >
                      <span>{category.name}</span>
                      <span className="text-xs">({category.post_count || 0})</span>
                    </Link>
                  ))}
                </div>
              </div>
              
              <Link
                href="/about"
                className="block py-2 text-sm font-medium text-foreground hover:text-primary"
              >
                소개
              </Link>
              
              {/* 모바일 관리자 버튼 */}
              <Link
                href="/admin"
                className="block py-2 text-sm font-medium text-foreground hover:text-primary"
              >
                관리자
              </Link>
            </nav>

            {/* 모바일 검색 */}
            <form onSubmit={handleSearch} className="mt-4 sm:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="search"
                  placeholder="검색..."
                  className="w-full pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>
        )}
      </div>
    </header>
  )
}
