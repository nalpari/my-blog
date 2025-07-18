import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          // Read-only operation
        },
        remove(name: string, options: any) {
          // Read-only operation
        },
      },
    }
  )

  try {
    // 현재 세션 상태 확인
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      return NextResponse.json(
        { 
          authenticated: false, 
          error: error.message,
          timestamp: new Date().toISOString()
        },
        { status: 200 }
      )
    }

    if (data.session) {
      return NextResponse.json(
        {
          authenticated: true,
          user: {
            id: data.session.user.id,
            email: data.session.user.email,
            created_at: data.session.user.created_at,
            last_sign_in_at: data.session.user.last_sign_in_at,
          },
          expires_at: data.session.expires_at,
          timestamp: new Date().toISOString()
        },
        { 
          status: 200,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Pragma': 'no-cache',
          }
        }
      )
    }

    return NextResponse.json(
      { 
        authenticated: false,
        message: 'No active session',
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    )

  } catch (err) {
    console.error('Auth status check error:', err)
    return NextResponse.json(
      { 
        authenticated: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to check auth status.' },
    { status: 405, headers: { Allow: 'GET' } }
  )
}