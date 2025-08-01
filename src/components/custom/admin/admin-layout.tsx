'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import ErrorBoundary from './error-boundary'

interface AdminLayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: '대시보드', href: '/admin', icon: '📊' },
  { name: '포스트 관리', href: '/admin/posts', icon: '📝' },
  { name: '새 포스트', href: '/admin/posts/new', icon: '➕' },
]

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, signOut } = useAuth()

  // 인증 상태 확인 및 리다이렉트
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [loading, user, router])

  // 로딩 중이거나 사용자가 없으면 로딩 UI 표시
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('로그아웃 중 오류가 발생했습니다:', error)
      // 사용자에게 오류 알림 (선택적)
      alert('로그아웃 중 문제가 발생했습니다. 다시 시도해주세요.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 헤더 */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link 
                href="/admin" 
                className="text-xl font-bold text-gray-900"
              >
                관리자 페이지
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {user && user.email ? user.email : '사용자 이메일 없음'}
              </div>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleLogout}
                className="font-medium hover:bg-red-700"
              >
                로그아웃
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium ml-2"
                asChild
              >
                <Link href="/">
                  블로그로 돌아가기
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* 사이드바 */}
        <nav className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
                      pathname === item.href
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 p-8">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}