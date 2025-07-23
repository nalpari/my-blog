import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 환경 변수 검증 로직 추가
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('필수 환경 변수가 누락되었습니다: ' + 
      (!supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL ' : '') + 
      (!supabaseAnonKey ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' : ''));
    
    // 환경 변수가 없는 경우 기본 응답 반환
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
  
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // 현재 세션 확인
  let session = null;
  try {
    const { data } = await supabase.auth.getSession();
    session = data.session;
  } catch (error) {
    // 에러 로깅
    console.error('세션 확인 중 오류가 발생했습니다:', error);
    
    // 에러 발생 시 기본 응답 반환 (미들웨어 안정성 유지)
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }

  // /admin 경로 보호
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      // 미인증 사용자는 로그인 페이지로 리다이렉트
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // 인증된 사용자가 로그인 페이지에 접근하는 경우
  if (request.nextUrl.pathname.startsWith('/auth/login') && session) {
    const redirectTo = request.nextUrl.searchParams.get('redirectTo')
    const redirectUrl = new URL(redirectTo || '/admin', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // 세션 갱신을 위한 응답 반환
  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/auth/login',
    '/auth/signup',
    '/auth/reset-password'
  ]
}