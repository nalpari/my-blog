# 📝 My Blog

![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/nalpari/my-blog?utm_source=oss&utm_medium=github&utm_campaign=nalpari%2Fmy-blog&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

모던한 기술 스택을 활용한 풀스택 블로그 플랫폼입니다. Next.js 15, TypeScript, Supabase를 기반으로 구축되었으며, 관리자 기능과 검색 기능을 포함한 완전한 블로그 시스템을 제공합니다.

## 🚀 주요 기능

### 📖 블로그 기능
- **포스트 관리**: 마크다운 에디터를 통한 포스트 작성 및 편집
- **카테고리 분류**: 포스트의 체계적인 분류를 위한 카테고리 시스템
- **태그 시스템**: 다중 태그 지원으로 콘텐츠 구성
- **조회수 추적**: Redis를 활용한 실시간 조회수 집계
- **댓글 시스템**: 사용자 인증 기반 댓글 기능

### 🔍 검색 기능
- **전체 화면 검색 모달**: 몰입도 높은 검색 경험
- **실시간 검색**: Debounce를 활용한 효율적인 실시간 검색
- **인기 검색어**: Redis 기반 인기 검색어 추적 및 표시
- **다중 필터**: 카테고리, 태그, 날짜별 필터링

### 👤 사용자 인증
- **Supabase Auth**: 이메일/패스워드 기반 인증
- **소셜 로그인**: GitHub, Google 소셜 로그인 지원
- **세션 관리**: JWT 기반 안전한 세션 관리
- **프로필 관리**: 사용자 프로필 및 아바타 관리

### 🛠️ 관리자 기능
- **관리자 대시보드**: 포스트, 사용자, 댓글 통합 관리
- **이미지 업로드**: AWS S3 연동 이미지 업로드
- **포스트 발행**: 임시 저장 및 예약 발행 기능
- **통계 대시보드**: 방문자 및 콘텐츠 통계

### 🎨 UI/UX
- **반응형 디자인**: 모바일 최적화된 레이아웃
- **다크 모드**: 시스템 설정 연동 다크 모드
- **사이드바**: 인기 포스트, 관련 포스트, 태그 클라우드
- **무한 스크롤**: 포스트 목록 무한 스크롤 지원

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js 15.3.5 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **State Management**: React Context API
- **Form Handling**: React Hook Form + Zod validation

### Backend
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma 6.11.1
- **Authentication**: Supabase Auth
- **Caching**: Redis (ioredis)
- **File Storage**: AWS S3
- **API**: Next.js API Routes

### DevOps & Tools
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions
- **Code Quality**: CodeRabbit AI Reviews
- **Testing**: Playwright E2E
- **Logging**: Pino

## 📁 프로젝트 구조

```
my-blog/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── admin/          # 관리자 페이지
│   │   ├── api/            # API Routes
│   │   ├── auth/           # 인증 페이지
│   │   ├── blog/           # 블로그 페이지
│   │   └── search/         # 검색 페이지
│   ├── components/         # React 컴포넌트
│   │   ├── custom/         # 커스텀 컴포넌트
│   │   ├── ui/             # shadcn/ui 컴포넌트
│   │   └── auth/           # 인증 컴포넌트
│   ├── contexts/           # React Context
│   ├── hooks/              # Custom Hooks
│   ├── lib/                # 유틸리티 함수
│   └── types/              # TypeScript 타입 정의
├── prisma/                 # Prisma 스키마
├── public/                 # 정적 파일
└── tests/                  # E2E 테스트
```

## 🚀 시작하기

### 필수 요구사항
- Node.js 18.0 이상
- PostgreSQL 데이터베이스 (Supabase)
- Redis 서버
- AWS S3 버킷 (이미지 업로드용)

### 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
# Database
DATABASE_URL="postgresql://..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."

# Redis
REDIS_URL="redis://..."

# AWS S3
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="..."
AWS_BUCKET_NAME="..."
```

### 설치 및 실행

```bash
# 의존성 설치
npm install

# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 마이그레이션
npx prisma migrate dev

# 개발 서버 실행
npm run dev
```

http://localhost:3000 에서 애플리케이션을 확인할 수 있습니다.

## 📝 스크립트

```bash
npm run dev          # 개발 서버 실행 (Turbopack)
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버 실행
npm run lint         # ESLint 실행
npm run test:e2e     # Playwright E2E 테스트
npm run test:e2e:ui  # Playwright UI 모드
```

## 🧪 테스트

E2E 테스트는 Playwright를 사용합니다:

```bash
# 헤드리스 모드로 테스트 실행
npm run test:e2e

# UI 모드로 테스트 실행
npm run test:e2e:ui

# 디버그 모드로 테스트 실행
npm run test:e2e:debug
```

## 🚀 배포

이 프로젝트는 Vercel에 최적화되어 있습니다:

1. [Vercel](https://vercel.com)에 GitHub 저장소를 연결합니다
2. 환경 변수를 설정합니다
3. 자동으로 배포가 시작됩니다

## 🛠️ 개발 도구

이 프로젝트는 다음 AI 도구들을 활용하여 개발되었습니다:

- **Claude Code**: 주요 코딩 작업
- **Cursor AI**: 코드 확인 및 레이아웃 디자인
- **Trae AI**: 코드 확인 및 터미널 작업
- **Manus**: 프로젝트 계획 수립
- **CodeRabbit**: Pull Request 자동 리뷰

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 🤝 기여하기

기여를 환영합니다! Pull Request를 보내주시거나 Issue를 생성해주세요.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
