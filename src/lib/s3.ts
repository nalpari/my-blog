import { S3Client } from '@aws-sdk/client-s3'

// S3 클라이언트는 API 요청 시에만 초기화
export function createS3Client() {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS credentials are not set in environment variables')
  }

  if (!process.env.AWS_REGION || !process.env.AWS_S3_BUCKET_NAME) {
    throw new Error('AWS region and S3 bucket name are required')
  }

  return new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  })
}

export const S3_CONFIG = {
  bucketName: process.env.AWS_S3_BUCKET_NAME || '',
  region: process.env.AWS_REGION || '',
  baseUrl: process.env.NEXT_PUBLIC_S3_BASE_URL || '',
} as const

// 환경 변수 검증 함수
export function validateS3Config() {
  const requiredVars = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY', 
    'AWS_REGION',
    'AWS_S3_BUCKET_NAME',
    'NEXT_PUBLIC_S3_BASE_URL'
  ]
  
  const missingVars = requiredVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
  }
}