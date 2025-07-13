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
import { Search, Menu, Sun, Moon } from 'lucide-react'
import { useState, useEffect } from 'react'

interface BlogHeaderProps {
  siteTitle?: string
}

export const BlogHeader = ({ siteTitle = 'My Blog' }: BlogHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

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
                        <Link
                          href="/blog/category/tech"
                          className="block p-2 hover:bg-accent rounded-md"
                        >
                          기술
                        </Link>
                        <Link
                          href="/blog/category/life"
                          className="block p-2 hover:bg-accent rounded-md"
                        >
                          일상
                        </Link>
                        <Link
                          href="/blog/category/review"
                          className="block p-2 hover:bg-accent rounded-md"
                        >
                          리뷰
                        </Link>
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
              <Link
                href="/about"
                className="block py-2 text-sm font-medium text-foreground hover:text-primary"
              >
                소개
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
