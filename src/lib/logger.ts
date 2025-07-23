'use client';

// 클라이언트와 서버 환경 모두에서 작동하는 로거

// 개발 환경 여부 확인
const isDevelopment = process.env.NODE_ENV !== 'production';

// 브라우저 환경인지 확인
const isBrowser = typeof window !== 'undefined';

// 간단한 로거 인터페이스 정의
type LoggerInterface = {
  info: (message: string | Record<string, any>, ...args: any[]) => void;
  warn: (message: string | Record<string, any>, ...args: any[]) => void;
  error: (message: string | Record<string, any>, ...args: any[]) => void;
  debug: (message: string | Record<string, any>, ...args: any[]) => void;
};

// 브라우저 환경용 로거
const browserLogger: LoggerInterface = {
  info: (message, ...args) => {
    if (isDevelopment) {
      if (typeof message === 'object') {
        console.info('[INFO]', message, ...args);
      } else {
        console.info('[INFO]', message, ...args);
      }
    }
  },
  warn: (message, ...args) => {
    if (typeof message === 'object') {
      console.warn('[WARN]', message, ...args);
    } else {
      console.warn('[WARN]', message, ...args);
    }
  },
  error: (message, ...args) => {
    if (typeof message === 'object') {
      console.error('[ERROR]', message, ...args);
    } else {
      console.error('[ERROR]', message, ...args);
    }
  },
  debug: (message, ...args) => {
    if (isDevelopment) {
      if (typeof message === 'object') {
        console.debug('[DEBUG]', message, ...args);
      } else {
        console.debug('[DEBUG]', message, ...args);
      }
    }
  },
};

// 서버 환경용 로거 (실제 pino 구현은 서버 컴포넌트에서만 사용)
// 기본값으로 브라우저 로거 사용
let serverLogger: LoggerInterface = browserLogger;

// 서버 환경에서만 pino 로거 초기화 시도
if (!isBrowser) {
  try {
    // 서버 환경에서만 pino를 로드
    const pino = require('pino');
    serverLogger = pino({
      level: isDevelopment ? 'info' : 'error',
      transport: isDevelopment
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
            },
          }
        : undefined,
      redact: {
        paths: ['*.token', '*.password', '*.accessToken', '*.refreshToken'],
        remove: true,
      },
    });
  } catch (e) {
    // pino 로드 실패 시 이미 browserLogger로 초기화되어 있으므로 아무것도 하지 않음
    console.error('Failed to initialize pino logger, falling back to browser logger', e);
  }
}

// 환경에 맞는 로거 내보내기
const logger = isBrowser ? browserLogger : serverLogger;

export default logger;