'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, loading, error, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 이미 로그인된 경우 대시보드로 리다이렉트
  if (user) {
    router.push('/admin');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(email, password);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">로그인</CardTitle>
          <CardDescription>
            계정에 로그인하여 블로그를 관리하세요
          </CardDescription>
        </CardHeader>
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
              />
            </div>
            {error && (
              <div className="text-sm text-red-500">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? '로그인 중...' : '로그인'}
            </Button>
            <div className="flex flex-col space-y-2 text-sm text-center text-gray-500">
              <div>
                계정이 없으신가요?{' '}
                <Link href="/auth/signup" className="text-blue-600 hover:text-blue-800">
                  회원가입
                </Link>
              </div>
              <div>
                <Link href="/auth/reset-password" className="text-blue-600 hover:text-blue-800">
                  비밀번호를 잊으셨나요?
                </Link>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}