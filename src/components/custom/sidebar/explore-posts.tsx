'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronRight } from 'lucide-react'
import { Category } from '@/types'

// 컴포넌트 외부로 이동해서 재생성 방지
const CATEGORY_ORDER = ['tech', 'lifestyle', 'review', 'tutorial']

export const ExplorePosts = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

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
        console.error('카테고리 로딩 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
    return (
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="px-0 pb-4">
          <CardTitle className="text-center text-lg font-semibold text-gray-800 dark:text-gray-200">
            Explore Posts
          </CardTitle>
          <div className="flex justify-center">
            <div className="w-8 h-0.5 bg-red-400 rounded"></div>
          </div>
        </CardHeader>
        <CardContent className="px-0 space-y-1">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex items-center justify-between py-2 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="w-8 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }
  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="px-0 pb-4">
        <CardTitle className="text-center text-lg font-semibold text-gray-800 dark:text-gray-200">
          Explore Posts
        </CardTitle>
        <div className="flex justify-center">
          <div className="w-8 h-0.5 bg-red-400 rounded"></div>
        </div>
      </CardHeader>
      <CardContent className="px-0 space-y-1">
        {categories.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            카테고리가 없습니다.
          </div>
        ) : (
          categories.map((category) => (
            <Link 
              key={category.id} 
              href={`/blog/category/${category.slug}`}
              className="group block"
            >
              <div className="flex items-center justify-between py-2 px-1 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors">
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-red-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                    {category.name}
                  </span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({category.post_count || 0})
                </span>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  )
}
