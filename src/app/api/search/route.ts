import { NextRequest, NextResponse } from 'next/server'
import { searchPosts, SearchOptions } from '@/lib/search'
import { z } from 'zod'
import { checkRateLimit } from '@/lib/redis'

// 검색 요청 스키마 정의
const searchSchema = z.object({
  q: z.string().min(1, '검색어를 입력해주세요.').max(100, '검색어는 100자 이하로 입력해주세요.'),
  limit: z.coerce.number().min(1).max(50).optional().default(10),
  offset: z.coerce.number().min(0).optional().default(0),
  category: z.string().optional().nullable(),
  tags: z.string().optional().nullable() // 쉼표로 구분된 태그 문자열
})

// 레이트 리미팅 설정
const RATE_LIMIT = 30 // 분당 최대 요청 수
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1분

// GET 요청 핸들러
export async function GET(request: NextRequest) {
  try {
    // IP 주소 추출
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
              request.headers.get('x-real-ip') || 
              'unknown'
    
    // Rate limiting 체크 (Redis 기반)
    const rateLimit = await checkRateLimit(ip, RATE_LIMIT, RATE_LIMIT_WINDOW_MS)
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
          code: 'RATE_LIMIT_EXCEEDED'
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': Math.ceil(rateLimit.resetTime / 1000).toString()
          }
        }
      )
    }
    
    // URL 파라미터 파싱
    const { searchParams } = new URL(request.url)
    const rawParams = {
      q: searchParams.get('q'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
      category: searchParams.get('category'),
      tags: searchParams.get('tags')
    }
    
    // 파라미터 검증
    const validationResult = searchSchema.safeParse(rawParams)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: '잘못된 요청 파라미터입니다.',
          details: validationResult.error.issues,
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      )
    }
    
    const { q, limit, offset, category, tags } = validationResult.data
    
    // 태그 문자열을 배열로 변환
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : undefined
    
    // 검색 옵션 구성
    const searchOptions: SearchOptions = {
      query: q,
      limit,
      offset,
      category: category || undefined,
      tags: tagsArray
    }
    
    // 검색 실행
    const searchResult = await searchPosts(searchOptions)
    
    // 응답 헤더 설정
    const responseHeaders = {
      'X-RateLimit-Limit': '30',
      'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      'X-RateLimit-Reset': Math.ceil(rateLimit.resetTime / 1000).toString(),
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' // 1분 캐시, 5분 stale-while-revalidate
    }
    
    return NextResponse.json(
      {
        success: true,
        data: {
          posts: searchResult.posts,
          pagination: {
            total: searchResult.total,
            limit,
            offset,
            hasMore: searchResult.hasMore,
            totalPages: Math.ceil(searchResult.total / limit),
            currentPage: Math.floor(offset / limit) + 1
          },
          query: {
            searchTerm: q,
            category,
            tags: tagsArray
          }
        }
      },
      { 
        status: 200,
        headers: responseHeaders
      }
    )
    
  } catch (error) {
    console.error('Search API error:', error)
    
    // 에러 타입에 따른 적절한 응답
    if (error instanceof Error) {
      if (error.message.includes('검색 중 오류가 발생했습니다')) {
        return NextResponse.json(
          { 
            error: '검색 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
            code: 'SEARCH_SERVICE_ERROR'
          },
          { status: 503 }
        )
      }
    }
    
    return NextResponse.json(
      { 
        error: '서버 내부 오류가 발생했습니다.',
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    )
  }
}

// POST 요청은 지원하지 않음
export async function POST() {
  return NextResponse.json(
    { 
      error: 'POST 메서드는 지원되지 않습니다.',
      code: 'METHOD_NOT_ALLOWED'
    },
    { status: 405 }
  )
}

// OPTIONS 요청 처리 (CORS)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  })
}