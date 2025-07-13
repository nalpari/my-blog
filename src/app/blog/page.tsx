import { blogApi } from '@/lib/prisma'
import { BlogPostCard } from '@/components/custom/blog-post-card'
import { BlogHeader } from '@/components/custom/blog-header'
import { BlogFooter } from '@/components/custom/blog-footer'
import { MainSidebar } from '@/components/custom/sidebar/main-sidebar'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '블로그 - 개발 이야기',
  description: '개발과 관련된 다양한 이야기와 경험을 공유합니다.',
}

export default async function BlogPage() {
  const { data: posts, error } = await blogApi.getPosts({ page: 1, limit: 20 })

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <BlogHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  포스트가 없습니다
                </h1>
                <p className="text-gray-600 dark:text-gray-400">아직 작성된 포스트가 없습니다.</p>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <MainSidebar />
              </div>
            </div>
          </div>
        </main>
        <BlogFooter />
      </div>
    )
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <BlogHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  아직 포스트가 없습니다
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  첫 번째 포스트를 작성해보세요!
                </p>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <MainSidebar />
              </div>
            </div>
          </div>
        </main>
        <BlogFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <BlogHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">블로그</h1>
              <p className="text-gray-600 dark:text-gray-400">
                개발과 관련된 다양한 이야기와 경험을 공유합니다.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {posts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          </div>

          {/* 사이드바 */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <MainSidebar />
            </div>
          </div>
        </div>
      </main>

      <BlogFooter />
    </div>
  )
}