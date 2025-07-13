import { NextRequest, NextResponse } from 'next/server'
import { blogApi } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '5')

    const result = await blogApi.getPopularPosts(limit)
    
    if (result.success) {
      return NextResponse.json({ 
        data: result.data,
        success: true 
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('인기 포스트 API 오류:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}