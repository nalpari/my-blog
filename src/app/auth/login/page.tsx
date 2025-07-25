'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';

// useSearchParams를 사용하는 컴포넌트를 분리
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, error } = useAuth();

  // 이미 로그인된 경우 대시보드로 리다이렉트 (useEffect 사용)
  useEffect(() => {
    if (user && !loading) {
      const redirectTo = searchParams.get('redirectTo');
      router.push(redirectTo || '/admin');
    }
  }, [user, loading, router, searchParams]);

  // 로딩 중이거나 이미 로그인된 경우 로딩 표시
  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {user ? '대시보드로 이동 중...' : '로딩 중...'}
          </p>
        </div>
      </div>
    );
  }

  const handleLoginSuccess = () => {
    const redirectTo = searchParams.get('redirectTo');
    router.push(redirectTo || '/admin');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">관리자 로그인</h1>
          <p className="mt-2 text-gray-600">블로그 관리 시스템에 접속하세요</p>
        </div>
        <LoginForm onSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
}

// 메인 페이지 컴포넌트
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}