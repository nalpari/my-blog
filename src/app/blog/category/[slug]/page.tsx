import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { blogApi } from '@/lib/prisma'
import { BlogPostCard } from '@/components/custom/blog-post-card'
import { MainSidebar } from '@/components/custom/sidebar/main-sidebar'
import { BlogHeader } from '@/components/custom/blog-header'
import { BlogFooter } from '@/components/custom/blog-footer'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ 
  params 
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  
  // 카테고리 정보 가져오기
  const categoriesResult = await blogApi.getCategories()
  const category = categoriesResult.success 
    ? categoriesResult.data?.find(cat => cat.slug === slug)
    : null

  if (!category) {
    return {
      title: '카테고리를 찾을 수 없습니다',
    }
  }

  return {
    title: `${category.name} - My Blog`,
    description: category.description || `${category.name} 카테고리의 포스트들을 확인해보세요.`,
  }
}

export default async function CategoryPage({ 
  params,
  searchParams 
}: CategoryPageProps) {
  const { slug } = await params
  const { page = '1' } = await searchParams
  
  // 카테고리 정보 가져오기
  const categoriesResult = await blogApi.getCategories()
  const category = categoriesResult.success 
    ? categoriesResult.data?.find(cat => cat.slug === slug)
    : null

  if (!category) {
    notFound()
  }

  // 해당 카테고리의 포스트들 가져오기
  const currentPage = parseInt(page as string) || 1
  const postsResult = await blogApi.getPostsByCategory(
    slug, 
    currentPage, 
    12
  )
  
  const posts = postsResult.success ? postsResult.data || [] : []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <BlogHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 카테고리 헤더 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {category.description}
                  </p>
                )}
                <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>총 {category.post_count || 0}개의 포스트</span>
                  {category.color && (
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"
                      style={{ backgroundColor: category.color }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* 포스트 목록 */}
            {posts.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center shadow-sm">
                <div className="text-gray-400 dark:text-gray-600 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  아직 포스트가 없습니다
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {category.name} 카테고리에 첫 번째 포스트를 기대해주세요!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post) => (
                  <BlogPostCard
                    key={post.id}
                    post={post}
                    showAuthor={true}
                    showViews={true}
                  />
                ))}
              </div>
            )}

            {/* 페이지네이션 (나중에 추가 가능) */}
            {posts.length > 0 && (
              <div className="flex justify-center mt-8">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  더 많은 포스트가 있다면 페이지네이션을 추가할 예정입니다.
                </p>
              </div>
            )}
          </div>

          {/* 사이드바 */}
          <div className="lg:col-span-1">
            <MainSidebar />
          </div>
        </div>
      </main>

      <BlogFooter />
    </div>
  )
}