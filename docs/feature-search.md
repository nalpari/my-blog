# 검색 모달 기능 구현 계획

## 🎯 개요
메인 헤더의 검색 영역에 포커스가 들어가면 전체 화면에 마스크를 씌우고 중앙에 검색창이 뜨는 기능을 구현합니다.

## 📋 구현 계획

### 1단계: 검색 모달 컴포넌트 생성
- **파일**: `src/components/custom/search-modal.tsx`
- **기능**: 전체 화면 오버레이와 중앙 검색창
- **특징**: 
  - 반투명 배경 마스크 (backdrop-blur 효과)
  - 중앙에 위치한 검색 입력창
  - ESC 키로 닫기 기능
  - 검색 결과 실시간 표시
  - 애니메이션 효과 (fade-in/out)

### 2단계: 상태 관리 추가
- **위치**: `blog-header.tsx`에 상태 추가
- **상태**: `isSearchModalOpen` (검색 모달 열림/닫힘)
- **이벤트**: 검색 입력창 포커스 시 모달 열기

### 3단계: 검색 API 연동
- **기존 API 활용**: `/api/search` 엔드포인트 (이미 구현됨)
- **실시간 검색**: debounce를 사용한 타이핑 중 검색
- **검색 결과**: 제목, 내용, 카테고리별 필터링

### 4단계: UI/UX 개선사항
- **키보드 네비게이션**: 화살표 키로 결과 탐색
- **검색 히스토리**: 최근 검색어 저장
- **빠른 액션**: 인기 태그, 최근 포스트 바로가기
- **반응형 디자인**: 모바일에서도 완벽한 경험

### 5단계: 성능 최적화
- **가상화**: 많은 검색 결과 처리
- **캐싱**: 검색 결과 임시 저장
- **지연 로딩**: 이미지 lazy loading

## 🛠️ 기술 스택
- **스타일링**: Tailwind CSS + shadcn/ui
- **애니메이션**: Framer Motion 또는 CSS transitions
- **상태 관리**: React useState/useEffect
- **검색 로직**: 기존 Prisma 검색 API 활용

## 📱 사용자 경험 플로우
1. 헤더의 검색창에 포커스 → 즉시 전체 화면 모달 열림
2. 배경은 블러 처리되고 반투명 마스크 적용
3. 중앙의 큰 검색창에서 편리한 검색
4. 실시간 검색 결과와 추천 기능
5. ESC 키나 배경 클릭으로 쉽게 닫기

## 🎨 디자인 요구사항

### 모달 오버레이
- 배경: `bg-black/50 backdrop-blur-sm`
- 애니메이션: fade-in/out 효과
- z-index: 최상위 레벨 (z-50 이상)

### 검색창 컨테이너
- 위치: 화면 중앙 정렬
- 크기: 최대 너비 600px, 반응형
- 배경: 카드 스타일 (`bg-background border rounded-lg shadow-lg`)
- 패딩: 적절한 여백 확보

### 검색 입력창
- 크기: 큰 사이즈 (h-12 이상)
- 아이콘: 검색 아이콘과 닫기 버튼
- 플레이스홀더: "검색어를 입력하세요..."
- 포커스: 자동 포커스 설정

### 검색 결과
- 레이아웃: 리스트 형태
- 항목: 제목, 요약, 카테고리, 날짜
- 하이라이트: 검색어 강조 표시
- 로딩: 스켈레톤 UI

## 🔧 구현 세부사항

### SearchModal 컴포넌트 구조
```typescript
interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  initialQuery?: string
}

const SearchModal = ({ isOpen, onClose, initialQuery }: SearchModalProps) => {
  // 상태 관리
  // 검색 로직
  // 키보드 이벤트 처리
  // 렌더링
}
```

### 상태 관리
- `searchQuery`: 현재 검색어
- `searchResults`: 검색 결과 배열
- `isLoading`: 로딩 상태
- `selectedIndex`: 키보드 네비게이션용 인덱스

### 이벤트 처리
- `onFocus`: 헤더 검색창 포커스 시 모달 열기
- `onEscape`: ESC 키로 모달 닫기
- `onBackdropClick`: 배경 클릭으로 모달 닫기
- `onArrowKeys`: 화살표 키로 결과 탐색
- `onEnter`: 엔터 키로 선택된 결과 이동

## 📝 파일 구조
```
src/components/custom/
├── search-modal.tsx          # 메인 검색 모달 컴포넌트
├── search-result-item.tsx    # 검색 결과 항목 컴포넌트
└── blog-header.tsx           # 기존 헤더 (수정)
```

## 🚀 구현 우선순위
1. **High**: 기본 모달 구조와 오버레이
2. **High**: 검색 입력창과 기본 스타일링
3. **Medium**: 검색 API 연동과 결과 표시
4. **Medium**: 키보드 네비게이션
5. **Low**: 검색 히스토리와 추천 기능
6. **Low**: 성능 최적화

## 🧪 테스트 계획
- 모달 열기/닫기 기능
- 검색 API 연동
- 키보드 네비게이션
- 반응형 디자인
- 접근성 (a11y)

## 📚 참고사항
- 기존 검색 API: `src/lib/prisma.ts`의 `searchPosts` 메서드 활용
- UI 컴포넌트: shadcn/ui의 Dialog, Input, Button 등 활용
- 애니메이션: Tailwind CSS의 transition 클래스 사용
- 접근성: ARIA 속성과 키보드 네비게이션 지원

---

**작성일**: 2024년
**작성자**: 개발팀
**상태**: 계획 단계