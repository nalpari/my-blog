import Redis from 'ioredis';
import logger from './logger';

// Redis 클라이언트 설정
let redis: Redis | null = null;

// Redis 연결 함수
export function getRedisClient() {
  if (redis) return redis;
  
  // 환경 변수에서 Redis URL 가져오기 (없으면 기본값 사용)
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  // 개발 환경에서는 Redis가 없을 수 있으므로 조건부 연결
  if (process.env.NODE_ENV === 'production' || process.env.USE_REDIS === 'true') {
    try {
      redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          // 재시도 전략: 최대 3번, 각 시도마다 100ms씩 증가
          return Math.min(times * 100, 3000);
        },
      });
      
      redis.on('error', (err) => {
        logger.error('Redis connection error:', err);
        redis = null; // 연결 실패 시 null로 설정하여 다음 요청에서 재시도
      });
      
      return redis;
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      return null;
    }
  }
  
  return null;
}

// Redis 기반 레이트 리미팅 구현
export async function checkRateLimit(ip: string, limit = 30, windowMs = 60 * 1000) {
  const redis = getRedisClient();
  const now = Date.now();
  const windowKey = `ratelimit:${ip}:${Math.floor(now / windowMs)}`;
  
  // Redis가 없는 경우 항상 허용 (개발 환경 등)
  if (!redis) {
    // 로거 대신 콘솔 사용
    console.log(`Redis 연결이 없어 레이트 리미팅이 비활성화되었습니다. IP: ${ip}`);
    return { 
      allowed: true, 
      remaining: limit - 1, 
      resetTime: now + windowMs 
    };
  }
  
  try {
    // Redis의 INCR 명령어로 카운터 증가 및 TTL 설정
    const count = await redis.incr(windowKey);
    
    // 첫 요청이면 만료 시간 설정 (밀리초를 초로 변환)
    if (count === 1) {
      await redis.expire(windowKey, Math.ceil(windowMs / 1000));
    }
    
    // TTL 확인 (초 단위)
    const ttl = await redis.ttl(windowKey);
    const resetTime = now + (ttl * 1000);
    
    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      resetTime
    };
  } catch (error) {
    logger.error('Rate limiting error:', error);
    // Redis 오류 시 기본적으로 허용 (서비스 중단 방지)
    return { 
      allowed: true, 
      remaining: 0, 
      resetTime: now + windowMs 
    };
  }
}