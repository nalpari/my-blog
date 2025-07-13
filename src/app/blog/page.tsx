import { blogApi } from '@/lib/prisma'
import { BlogPostCard } from '@/components/custom/blog-post-card'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '블로그 - 개발 이야기',
  description: '개발과 관련된 다양한 이야기와 경험을 공유합니다.',
}

export default async function BlogPage() {
  const { data: posts, error } = await blogApi.getPosts(1, 20)

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            포스트가 없습니다
          </h1>
          <p className="text-gray-600">아직 작성된 포스트가 없습니다.</p>
        </div>
      </div>
    )
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            아직 포스트가 없습니다
          </h1>
          <p className="text-gray-600">
            첫 번째 포스트를 작성해보세요!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">블로그</h1>
        <p className="text-gray-600">
          개발과 관련된 다양한 이야기와 경험을 공유합니다.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogPostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}