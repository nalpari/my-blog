import { NextRequest, NextResponse } from 'next/server'
import { adminApi, blogApi } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await adminApi.getPostById(id)
    
    if (result.success) {
      return NextResponse.json(result.data)
    } else {
      return NextResponse.json({ error: result.error }, { status: 404 })
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const result = await adminApi.updatePost(id, body)
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await adminApi.deletePost(id)
    
    if (result.success) {
      return NextResponse.json({ message: '포스트가 삭제되었습니다.' })
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}