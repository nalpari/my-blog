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
    }
  )

  try {
    // 현재 세션 확인 및 갱신
    const { data, error } = await supabase.auth.refreshSession()

    if (error) {
      console.error('Session refresh error:', error)
      return NextResponse.json(
        { error: 'Failed to refresh session', details: error.message },
        { status: 401 }
      )
    }

    if (data.session) {
      const response = NextResponse.json(
        { 
          message: 'Session refreshed successfully',
          user: data.user,
          expires_at: data.session.expires_at 
        },
        { status: 200 }
      )

      // 새로운 토큰으로 쿠키 업데이트
      const expires = new Date(data.session.expires_at! * 1000)
      
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

      return response
    }

    return NextResponse.json(
      { error: 'No session found' },
      { status: 401 }
    )

  } catch (err) {
    console.error('Session refresh exception:', err)
    return NextResponse.json(
      { error: 'Internal server error during session refresh' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to refresh session.' },
    { status: 405, headers: { Allow: 'POST' } }
  )
}