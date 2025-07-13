import { NextResponse } from 'next/server'
import { blogApi } from '@/lib/prisma'

export async function GET() {
  try {
    const result = await blogApi.getCategories()
    
    if (result.success) {
      return NextResponse.json(result.data)
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error('Categories API Error:', error)
    return NextResponse.json({ error: '카테고리 조회 중 오류가 발생했습니다.' }, { status: 500 })
  }
}