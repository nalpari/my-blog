'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const { resetPassword, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await resetPassword(email);
    setIsSubmitted(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">비밀번호 재설정</CardTitle>
          <CardDescription>
            가입한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
          </CardDescription>
        </CardHeader>
        {!isSubmitted ? (
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
                {loading ? '처리 중...' : '비밀번호 재설정 링크 받기'}
              </Button>
              <div className="text-sm text-center text-gray-500">
                <Link href="/auth/login" className="text-blue-600 hover:text-blue-800">
                  로그인으로 돌아가기
                </Link>
              </div>
            </CardFooter>
          </form>
        ) : (
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    비밀번호 재설정 링크가 이메일로 전송되었습니다. 이메일을 확인해주세요.
                  </p>
                </div>
              </div>
            </div>
            <div className="text-center">
              <Link href="/auth/login" className="text-blue-600 hover:text-blue-800">
                로그인으로 돌아가기
              </Link>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}