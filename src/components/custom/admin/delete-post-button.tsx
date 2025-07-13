'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DeletePostButtonProps {
  postId: string
  postTitle: string
}

export function DeletePostButton({ postId, postTitle }: DeletePostButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`정말로 "${postTitle}" 포스트를 삭제하시겠습니까?`)) {
      return
    }

    setIsDeleting(true)
    
    try {
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('포스트가 삭제되었습니다.')
        router.refresh() // 페이지 새로고침
      } else {
        alert('포스트 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('삭제 에러:', error)
      alert('포스트 삭제 중 오류가 발생했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-900 disabled:opacity-50"
    >
      {isDeleting ? '삭제 중...' : '삭제'}
    </button>
  )
}