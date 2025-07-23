import { prisma } from '@/lib/prisma'

export interface SearchResult {
  id: number
  title: string
  content: string
  slug: string
  published_at: Date | null
  author: {
    name: string
    avatar_url: string | null
  }
  category: {
    name: string
    slug: string
    color: string | null
  } | null
  tags: string[]
  views: number
  image_url: string | null
  alt_text: string | null
}

export interface SearchOptions {
  query: string
  limit?: number
  offset?: number
  category?: string
  tags?: string[]
}

/**
 * 검색어를 정규화하고 PostgreSQL 전문 검색을 위한 형태로 변환
 */
export function normalizeSearchQuery(query: string): string {
  // 특수문자 제거 및 공백 정규화
  const normalized = query
    .trim()
    .replace(/[^\w\s가-힣]/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()

  // PostgreSQL 전문 검색을 위한 형태로 변환
  const terms = normalized.split(' ').filter(term => term.length > 0)
  
  if (terms.length === 0) return ''
  
  // 각 단어를 OR 조건으로 연결하고 부분 매칭을 위해 :* 추가
  return terms.map(term => `${term}:*`).join(' | ')
}

/**
 * 블로그 포스트 검색 함수
 */
export async function searchPosts(options: SearchOptions): Promise<{
  posts: SearchResult[]
  total: number
  hasMore: boolean
}> {
  const { query, limit = 10, offset = 0, category, tags } = options
  
  if (!query.trim()) {
    return { posts: [], total: 0, hasMore: false }
  }

  const normalizedQuery = normalizeSearchQuery(query)
  
  if (!normalizedQuery) {
    return { posts: [], total: 0, hasMore: false }
  }

  // 기본 WHERE 조건
  const whereConditions: any = {
    is_published: true,
    published_at: {
      lte: new Date()
    },
    OR: [
      {
        title: {
          contains: query,
          mode: 'insensitive'
        }
      },
      {
        content: {
          contains: query,
          mode: 'insensitive'
        }
      },
      {
        tags: {
          hasSome: query.split(' ').filter(term => term.length > 0)
        }
      }
    ]
  }

  // 카테고리 필터 추가
  if (category) {
    whereConditions.categories = {
      slug: category
    }
  }

  // 태그 필터 추가
  if (tags && tags.length > 0) {
    whereConditions.tags = {
      hasSome: tags
    }
  }

  try {
    // 총 개수 조회
    const total = await prisma.posts.count({
      where: whereConditions
    })

    // 검색 결과 조회
    const posts = await prisma.posts.findMany({
      where: whereConditions,
      select: {
        id: true,
        title: true,
        content: true,
        slug: true,
        published_at: true,
        tags: true,
        views: true,
        image_url: true,
        alt_text: true,
        users: {
          select: {
            profiles: {
              select: {
                name: true,
                avatar_url: true
              }
            }
          }
        },
        categories: {
          select: {
            name: true,
            slug: true,
            color: true
          }
        }
      },
      orderBy: [
        {
          published_at: 'desc'
        },
        {
          views: 'desc'
        }
      ],
      take: limit,
      skip: offset
    })

    // 결과 변환
    const searchResults: SearchResult[] = posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      slug: post.slug,
      published_at: post.published_at,
      author: {
        name: post.users.profiles?.name || 'Unknown',
        avatar_url: post.users.profiles?.avatar_url || null
      },
      category: post.categories,
      tags: post.tags,
      views: post.views,
      image_url: post.image_url,
      alt_text: post.alt_text
    }))

    return {
      posts: searchResults,
      total,
      hasMore: offset + limit < total
    }
  } catch (error) {
    console.error('Search error:', error)
    throw new Error('검색 중 오류가 발생했습니다.')
  }
}

/**
 * HTML 엔티티를 이스케이프하는 함수
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * 검색어 하이라이트 함수 - XSS 방지를 위해 HTML 엔티티를 이스케이프 처리
 */
export function highlightSearchTerms(text: string, query: string): string {
  if (!query.trim()) return escapeHtml(text)
  
  // 먼저 HTML 엔티티를 이스케이프
  const escapedText = escapeHtml(text)
  
  const terms = query
    .trim()
    .split(' ')
    .filter(term => term.length > 0)
    .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // 정규식 특수문자 이스케이프
  
  if (terms.length === 0) return escapedText
  
  const regex = new RegExp(`(${terms.join('|')})`, 'gi')
  return escapedText.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>')
}

/**
 * 인기 검색어 조회 (향후 구현을 위한 스켈레톤)
 */
export async function getPopularSearchTerms(limit: number = 10): Promise<string[]> {
  // TODO: 검색 로그 테이블이 구현되면 실제 인기 검색어를 반환
  // 임시로 인기 검색어 목록 반환
  const popularTerms = [
    'React', 'Next.js', 'TypeScript', 'JavaScript',
    'CSS', 'Node.js', 'Python', 'AI', 'Machine Learning',
    'Web Development', 'Frontend', 'Backend', 'Database',
    'GraphQL', 'REST API', 'Authentication', 'Redux',
    'React Hooks', 'Tailwind CSS', 'Responsive Design'
  ]
  
  // 요청된 limit 수만큼 반환
  return popularTerms.slice(0, limit)
}

/**
 * 검색 제안어 생성 (향후 구현을 위한 스켈레톤)
 */
export async function getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
  // TODO: 태그나 제목에서 유사한 검색어 제안
  return []
}