import { NextRequest, NextResponse } from 'next/server'
import { getPopularSearchTerms } from '@/lib/search'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    // 인기 검색어 가져오기
    const popularTerms = await getPopularSearchTerms(limit)
    
    return NextResponse.json({ 
      data: popularTerms,
      success: true 
    }, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' // 5분 캐시, 10분 stale-while-revalidate
      }
    })
  } catch (error) {
    console.error('인기 검색어 API 오류:', error)
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    )
  }
}