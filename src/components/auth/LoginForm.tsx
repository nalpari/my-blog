'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

// 폼 스키마 정의
const loginSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요')
    .email('올바른 이메일 형식을 입력해주세요'),
  password: z
    .string()
    .min(1, '비밀번호를 입력해주세요')
    .min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { signIn, loading, error } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setCustomError(null); // 새 요청 시 커스텀 에러 초기화
    
    try {
      await signIn(data.email, data.password);
      
      // signIn이 예외를 던지지 않았다면 성공으로 간주하고 바로 성공 로직 실행
      reset();
      onSuccess?.();
    } catch (err) {
      console.error('Login error:', err);
      // 리프레시 토큰 오류인 경우 특별 처리
      if (err instanceof Error && 
          (err.message.includes('Refresh Token') || 
           err.message.includes('Invalid Refresh Token'))) {
        setCustomError('인증 세션이 만료되었습니다. 다시 로그인해 주세요.');
      }
      // 다른 에러는 useAuth 내부에서 처리됨
    } finally {
      setIsSubmitting(false);
    }
  };

  // error가 변경될 때 customError 초기화
  useEffect(() => {
    if (error) {
      setCustomError(null);
    }
  }, [error]);

  const isLoading = loading || isSubmitting;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">로그인</CardTitle>
        <CardDescription>
          계정에 로그인하여 블로그를 관리하세요
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="your-email@example.com"
              aria-describedby={errors.email ? 'email-error' : undefined}
              aria-invalid={!!errors.email}
              {...register('email')}
            />
            {errors.email && (
              <p 
                id="email-error" 
                className="text-sm text-red-500" 
                role="alert"
                aria-live="polite"
              >
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              aria-describedby={errors.password ? 'password-error' : undefined}
              aria-invalid={!!errors.password}
              {...register('password')}
            />
            {errors.password && (
              <p 
                id="password-error" 
                className="text-sm text-red-500" 
                role="alert"
                aria-live="polite"
              >
                {errors.password.message}
              </p>
            )}
          </div>

          {(error || customError) && (
            <div 
              className="text-sm text-red-500 p-3 bg-red-50 border border-red-200 rounded-md"
              role="alert"
              aria-live="polite"
            >
              {customError || error}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            aria-describedby="login-button-status"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>
          <div 
            id="login-button-status" 
            className="sr-only" 
            aria-live="polite"
          >
            {isLoading ? '로그인 처리 중입니다. 잠시만 기다려주세요.' : '로그인 버튼입니다.'}
          </div>
          
          <div className="flex flex-col space-y-2 text-sm text-center text-gray-500">
            <div>
              계정이 없으신가요?{' '}
              <Link 
                href="/auth/signup" 
                className="text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              >
                회원가입
              </Link>
            </div>
            <div>
              <Link 
                href="/auth/reset-password" 
                className="text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              >
                비밀번호를 잊으셨나요?
              </Link>
            </div>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}