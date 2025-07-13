'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/custom/admin/admin-layout'
import { MarkdownEditor } from '@/components/custom/markdown-editor'
import { ImageUpload } from '@/components/custom/image-upload'
import { Category } from '@/types'

export default function NewPostPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    slug: '',
    category_id: '',
    tags: '',
    image_url: '',
    alt_text: '',
    is_published: false
  })

  // 카테고리 목록 로드
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const result = await response.json()
          setCategories(result)
        }
      } catch (error) {
        console.error('카테고리 로드 실패:', error)
      }
    }

    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      
      const response = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags: tagsArray,
          category_id: formData.category_id || null,
          author_id: '00000000-0000-0000-0000-000000000001' // TODO: 실제 사용자 인증 구현 후 변경
        }),
      })

      if (response.ok) {
        router.push('/admin/posts')
      } else {
        alert('포스트 저장에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('포스트 저장 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const generateSlug = () => {
    // 한글을 로마자로 변환하는 간단한 매핑
    const koreanToRoman: { [key: string]: string } = {
      '테스트': 'test',
      '포스트': 'post',
      '블로그': 'blog',
      '기술': 'tech',
      '리뷰': 'review',
      '튜토리얼': 'tutorial',
      '라이프스타일': 'lifestyle'
    }
    
    let slug = formData.title.toLowerCase()
    
    // 한글 단어 변환
    Object.keys(koreanToRoman).forEach(korean => {
      slug = slug.replace(new RegExp(korean, 'g'), koreanToRoman[korean])
    })
    
    // 나머지 한글 제거 및 URL 안전한 문자로 변환
    slug = slug
      .replace(/[ㄱ-ㅎㅏ-ㅣ가-힣]/g, '') // 한글 제거
      .replace(/[^\w\s-]/g, '') // 특수문자 제거
      .replace(/\s+/g, '-') // 공백을 하이픈으로
      .replace(/-+/g, '-') // 연속 하이픈 정리
      .trim()
      .replace(/^-+|-+$/g, '') // 앞뒤 하이픈 제거
    
    // 빈 문자열인 경우 기본값 설정
    if (!slug) {
      slug = `post-${Date.now()}`
    }
    
    setFormData(prev => ({ ...prev, slug }))
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">새 포스트 작성</h1>
          <p className="mt-2 text-gray-600">새로운 블로그 포스트를 작성하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white shadow-sm border rounded-lg p-6">
            {/* 제목 */}
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  제목 *
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="포스트 제목을 입력하세요"
                />
              </div>

              {/* 슬러그 */}
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                  슬러그 (URL) *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    id="slug"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="url-friendly-slug"
                  />
                  <button
                    type="button"
                    onClick={generateSlug}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    자동 생성
                  </button>
                </div>
              </div>

              {/* 카테고리 */}
              <div>
                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리
                </label>
                <select
                  id="category_id"
                  value={formData.category_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">카테고리를 선택하세요</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 내용 */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  내용 *
                </label>
                <MarkdownEditor
                  value={formData.content}
                  onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                  placeholder="마크다운 형식으로 내용을 작성하세요..."
                  height={500}
                />
              </div>

              {/* 태그 */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  태그
                </label>
                <input
                  type="text"
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="태그를 쉼표로 구분하여 입력하세요 (예: React, Next.js, TypeScript)"
                />
              </div>

              {/* 대표 이미지 업로드 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  대표 이미지
                </label>
                <ImageUpload
                  value={formData.image_url}
                  onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                  onAltTextChange={(altText) => setFormData(prev => ({ ...prev, alt_text: altText }))}
                  altText={formData.alt_text}
                />
              </div>

              {/* 발행 여부 */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_published" className="ml-2 block text-sm text-gray-700">
                  즉시 발행
                </label>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}