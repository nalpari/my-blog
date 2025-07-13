import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronRight } from 'lucide-react'

interface ExploreCategory {
  id: string
  name: string
  slug: string
  count: number
}

const exploreCategories: ExploreCategory[] = [
  {
    id: '1',
    name: '기술',
    slug: 'tech',
    count: 8,
  },
  {
    id: '2',
    name: '일상',
    slug: 'daily',
    count: 3,
  },
  {
    id: '3',
    name: '리뷰',
    slug: 'review',
    count: 5,
  },
  {
    id: '4',
    name: '튜토리얼',
    slug: 'tutorial',
    count: 6,
  },
]

export const ExplorePosts = () => {
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
        {exploreCategories.map((category) => (
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
                ({category.count})
              </span>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
