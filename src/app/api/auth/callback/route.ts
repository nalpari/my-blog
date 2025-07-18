import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/admin'

  if (code) {
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
      }
    )

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('OAuth callback error:', error)
        return NextResponse.redirect(`${origin}/auth/login?error=callback_error`)
      }

      if (data.session) {
        // 성공적으로 세션이 생성됨
        const response = NextResponse.redirect(`${origin}${next}`)
        
        // 세션 쿠키 설정
        const expires = new Date(data.session.expires_at! * 1000)
        
        response.cookies.set('sb-access-token', data.session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          expires,
          path: '/',
        })

        response.cookies.set('sb-refresh-token', data.session.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1년
          path: '/',
        })

        return response
      }
    } catch (err) {
      console.error('Session exchange error:', err)
      return NextResponse.redirect(`${origin}/auth/login?error=session_error`)
    }
  }

  // 인증 코드가 없거나 세션 생성 실패
  return NextResponse.redirect(`${origin}/auth/login?error=no_code`)
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405, headers: { Allow: 'GET' } }
  )
}