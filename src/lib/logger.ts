import pino from 'pino';

// 환경에 따른 로그 레벨 설정
const logLevel = process.env.NODE_ENV === 'production' ? 'error' : 'info';

// 개발 환경에서는 예쁘게 포맷팅된 로그 사용
const transport = process.env.NODE_ENV !== 'production'
  ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
      },
    }
  : undefined;

// 로거 인스턴스 생성
const logger = pino({
  level: logLevel,
  transport,
  redact: {
    paths: ['*.token', '*.password', '*.accessToken', '*.refreshToken', 'hasAccessToken', 'hasRefreshToken'],
    remove: true,
  },
});

export default logger;