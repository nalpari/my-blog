import { NextRequest, NextResponse } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { createS3Client, S3_CONFIG, validateS3Config } from '@/lib/s3'
import { v4 as uuidv4 } from 'uuid'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

export async function POST(request: NextRequest) {
  try {
    // 환경 변수 검증
    validateS3Config()
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: '파일이 제공되지 않았습니다.' }, { status: 400 })
    }

    // 파일 크기 검증
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: '파일 크기는 5MB를 초과할 수 없습니다.' }, { status: 400 })
    }

    // 파일 타입 검증
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: '지원되지 않는 파일 형식입니다. JPG, PNG, GIF, WebP만 지원됩니다.' 
      }, { status: 400 })
    }

    // 고유한 파일명 생성
    const fileExtension = file.name.split('.').pop()
    const fileName = `blog-images/${uuidv4()}.${fileExtension}`

    // 파일을 버퍼로 변환
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // S3에 업로드
    const s3Client = createS3Client()
    const uploadCommand = new PutObjectCommand({
      Bucket: S3_CONFIG.bucketName,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
      ContentDisposition: 'inline',
      CacheControl: 'max-age=31536000', // 1년 캐시
    })

    await s3Client.send(uploadCommand)

    // 업로드된 이미지 URL 생성
    const imageUrl = `${S3_CONFIG.baseUrl}/${fileName}`

    return NextResponse.json({
      success: true,
      imageUrl,
      fileName,
      fileSize: file.size,
      contentType: file.type,
    })

  } catch (error) {
    console.error('S3 업로드 에러:', error)
    
    if (error instanceof Error) {
      // AWS 관련 에러 처리
      if (error.name === 'CredentialsError') {
        return NextResponse.json({ error: 'AWS 인증 정보가 올바르지 않습니다.' }, { status: 500 })
      }
      if (error.name === 'NoSuchBucket') {
        return NextResponse.json({ error: 'S3 버킷을 찾을 수 없습니다.' }, { status: 500 })
      }
    }

    return NextResponse.json({ error: '이미지 업로드 중 오류가 발생했습니다.' }, { status: 500 })
  }
}