'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, loading: authLoading, error, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // 컴포넌트가 마운트된 후에만 리다이렉션 로직 실행
  useEffect(() => {
    setIsMounted(true);
    
    if (user) {
      setIsRedirecting(true);
      router.push('/admin');
    }
  }, [user, router]);

  // 로딩 상태 - 서버와 클라이언트 간 하이드레이션 불일치 방지
  const loading = authLoading || !isMounted || isRedirecting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 비밀번호 확인
    if (password !== confirmPassword) {
      setPasswordError('비밀번호가 일치하지 않습니다.');
      return;
    }
    
    setPasswordError('');
    await signUp(email, password);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {isRedirecting ? '리다이렉트 중...' : '회원가입'}
          </CardTitle>
          <CardDescription>
            {isRedirecting 
              ? '로그인된 사용자를 위한 페이지로 이동합니다' 
              : '새 계정을 만들어 블로그를 관리하세요'}
          </CardDescription>
        </CardHeader>
        {!isRedirecting && (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your-email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              {passwordError && (
                <div className="text-sm text-red-500">
                  {passwordError}
                </div>
              )}
              {error && (
                <div className="text-sm text-red-500">
                  {error}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-4">
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? '가입 중...' : '회원가입'}
              </Button>
              <div className="text-sm text-center text-gray-500">
                이미 계정이 있으신가요?{' '}
                <Link href="/auth/login" className="text-blue-600 hover:text-blue-800">
                  로그인
                </Link>
              </div>
            </CardFooter>
          </form>
        )}
        {isRedirecting && (
          <CardContent className="flex justify-center py-6">
            <div className="animate-pulse text-center">
              <p>관리자 페이지로 이동 중입니다...</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}