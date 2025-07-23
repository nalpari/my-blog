import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import logger from '@/lib/logger'

export async function POST(request: NextRequest) {
  // 쿠키에서 리프레시 토큰 확인
  const refreshToken = request.cookies.get('sb-refresh-token')?.value;
  const accessToken = request.cookies.get('sb-access-token')?.value;
  
  // 개발 환경에서만 상세 로그 기록
  logger.debug('Refresh attempt with tokens', { 
    hasRefreshToken: !!refreshToken,
    hasAccessToken: !!accessToken 
  });

  // 환경 변수 유효성 검사
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    logger.error('Missing required environment variables', { 
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseAnonKey: !!supabaseAnonKey 
    });
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
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
          // Will be handled by the response
        },
        remove(name: string, options: any) {
          // Will be handled by the response
        },
      },
    }
  )

  try {
    // 리프레시 토큰이 없는 경우 먼저 세션 확인
    if (!refreshToken) {
      const { data: sessionData } = await supabase.auth.getSession();
      
      // 세션이 있으면 그 세션 정보 반환
      if (sessionData.session) {
        logger.debug('Found existing session without refresh token');
        const response = NextResponse.json(
          { 
            message: 'Using existing session',
            user: sessionData.session.user,
            expires_at: sessionData.session.expires_at 
          },
          { status: 200 }
        )

        // 토큰 쿠키 설정
        const expires = new Date(sessionData.session.expires_at! * 1000);
        
        response.cookies.set('sb-access-token', sessionData.session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          expires,
          path: '/',
        })

        if (sessionData.session.refresh_token) {
          response.cookies.set('sb-refresh-token', sessionData.session.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1년
            path: '/',
          })
        }

        return response;
      }
    }

    // 세션 갱신 시도
    logger.debug('Attempting to refresh session');
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      logger.error('Session refresh error:', error);
      
      // 리프레시 토큰 오류인 경우 쿠키 삭제 후 로그인 페이지로 안내
      if (error.message.includes('Refresh Token') || error.message.includes('Invalid Refresh Token')) {
        const response = NextResponse.json(
          { error: 'Invalid refresh token', details: error.message, action: 'login_required' },
          { status: 401 }
        );
        
        // 만료된 쿠키 삭제
        const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax' as const,
          path: '/',
          expires: new Date(0), // 즉시 만료
        };
        
        response.cookies.set('sb-access-token', '', cookieOptions);
        response.cookies.set('sb-refresh-token', '', cookieOptions);
        
        return response;
      }
      
      return NextResponse.json(
        { error: 'Failed to refresh session', details: error.message },
        { status: 401 }
      );
    }

    if (data.session) {
      logger.info('Session refreshed successfully');
      const response = NextResponse.json(
        { 
          message: 'Session refreshed successfully',
          user: data.session.user,
          expires_at: data.session.expires_at 
        },
        { status: 200 }
      )

      // 새로운 토큰으로 쿠키 업데이트
      const expires = new Date(data.session.expires_at! * 1000);
      
      response.cookies.set('sb-access-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires,
        path: '/',
      })

      if (data.session.refresh_token) {
        response.cookies.set('sb-refresh-token', data.session.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1년
          path: '/',
        })
      }

      return response;
    }

    logger.debug('No session found after refresh attempt');
    return NextResponse.json(
      { error: 'No session found', action: 'login_required' },
      { status: 401 }
    );

  } catch (err) {
    logger.error('Session refresh exception:', err);
    return NextResponse.json(
      { error: 'Internal server error during session refresh' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to refresh session.' },
    { status: 405, headers: { Allow: 'POST' } }
  )
}