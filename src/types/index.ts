// 카테고리 타입
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
  created_at: string
  post_count?: number
}

// 블로그 포스팅 관련 타입 정의
export interface Post {
  id: string
  created_at: string
  title: string
  content: string
  slug: string
  author_id: string
  category_id?: string
  published_at: string | null
  is_published: boolean
  tags: string[]
  views: number
  // 새로 추가되는 이미지 관련 필드
  image_url?: string
  alt_text?: string
  // 관계 데이터
  category?: Category
}

// 사용자 프로필 타입
export interface Profile {
  id: string
  email: string
  name: string
  avatar_url?: string
  bio?: string
  created_at: string
}

// 댓글 타입 (향후 사용)
export interface Comment {
  id: string
  post_id: string
  author_id: string
  content: string
  created_at: string
  is_approved: boolean
}

// 태그 타입
export interface Tag {
  id: string
  name: string
  slug: string
  post_count: number
}

// API 응답 타입
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

// 페이지네이션 타입
export interface PaginationParams {
  page: number
  limit: number
  total: number
}

// 블로그 설정 타입
export interface BlogSettings {
  site_title: string
  site_description: string
  site_url: string
  author_name: string
  author_email: string
  theme_color: string
}
