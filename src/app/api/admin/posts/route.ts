import { NextRequest, NextResponse } from 'next/server'
import { adminApi } from '@/lib/prisma'

export async function GET() {
  try {
    const result = await adminApi.getAllPosts()
    
    if (result.success) {
      return NextResponse.json(result.data)
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const result = await adminApi.createPost(body)
    
    if (result.success) {
      return NextResponse.json(result.data, { status: 201 })
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}