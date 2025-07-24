import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
    },
  )

  try {
    // Supabase에서 로그아웃 처리
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Signout error:', error)
      return NextResponse.json(
        { error: 'Failed to sign out', details: error.message },
        { status: 500 },
      )
    }

    // 성공적으로 로그아웃됨 - 쿠키 삭제
    const response = NextResponse.json(
      { message: 'Successfully signed out' },
      { status: 200 },
    )

    // 세션 쿠키들 삭제
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      expires: new Date(0), // 즉시 만료
    }

    response.cookies.set('sb-access-token', '', cookieOptions)
    response.cookies.set('sb-refresh-token', '', cookieOptions)

    // Supabase 기본 쿠키들도 삭제
    const supabaseCookies = [
      'sb-localhost-auth-token',
      'sb-auth-token',
      'supabase-auth-token',
      'supabase.auth.token',
    ]

    supabaseCookies.forEach((cookieName) => {
      response.cookies.set(cookieName, '', cookieOptions)
    })

    return response
  } catch (err) {
    console.error('Signout exception:', err)
    return NextResponse.json(
      { error: 'Internal server error during signout' },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  // GET 요청도 지원 (리다이렉트 방식)
  const { origin } = new URL(request.url)
  const next = new URL(request.url).searchParams.get('next') ?? '/auth/login'

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          // Will be handled by the redirect response
        },
        remove(name: string, options: any) {
          // Will be handled by the redirect response
        },
      },
    },
  )

  try {
    await supabase.auth.signOut()

    const response = NextResponse.redirect(`${origin}${next}`)

    // 쿠키 삭제
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      expires: new Date(0),
    }

    response.cookies.set('sb-access-token', '', cookieOptions)
    response.cookies.set('sb-refresh-token', '', cookieOptions)

    return response
  } catch (err) {
    console.error('GET signout error:', err)
    return NextResponse.redirect(`${origin}/auth/login?error=signout_failed`)
  }
}

// OPTIONS 요청 지원 (CORS)
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      Allow: 'GET, POST, OPTIONS',
      'Access-Control-Allow-Origin':
        process.env.NODE_ENV === 'production'
          ? process.env.NEXT_PUBLIC_SITE_URL
          : 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    } as Record<string, string>,
  })
}
