import Link from 'next/link'
import { AdminLayout } from '@/components/custom/admin/admin-layout'
import { DeletePostButton } from '@/components/custom/admin/delete-post-button'
import { adminApi } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'

export default async function AdminPostsPage() {
  const postsResult = await adminApi.getAllPosts()
  const posts = postsResult.success ? postsResult.data : []

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">포스트 관리</h1>
            <p className="mt-2 text-gray-600">전체 {posts.length}개의 포스트</p>
          </div>
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            새 포스트 작성
          </Link>
        </div>

        {/* 포스트 목록 */}
        <div className="bg-white shadow-sm border rounded-lg overflow-hidden">
          {posts.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">포스트가 없습니다</h3>
              <p className="text-gray-600 mb-4">첫 번째 포스트를 작성해보세요!</p>
              <Link
                href="/admin/posts/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                새 포스트 작성
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      제목
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      조회수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작성일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      발행일
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {post.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              /{post.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          post.is_published 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {post.is_published ? '발행됨' : '초안'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {post.views.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(post.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {post.published_at ? formatDate(post.published_at) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="text-blue-600 hover:text-blue-900"
                          target="_blank"
                        >
                          보기
                        </Link>
                        <Link
                          href={`/admin/posts/${post.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          편집
                        </Link>
                        <DeletePostButton 
                          postId={post.id} 
                          postTitle={post.title}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}