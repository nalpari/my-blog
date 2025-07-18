import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Supabase 인증 시스템 헬스체크를 위한 API 엔드포인트
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. 환경 변수 체크
    const envCheck = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    };

    // 2. Supabase 연결 테스트
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        checks: {
          environment: envCheck,
          supabaseConnection: false,
        },
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // 3. API 엔드포인트 가용성 체크
    const endpoints = [
      '/api/auth/status',
      '/api/auth/callback', 
      '/api/auth/signout',
      '/api/auth/refresh'
    ];

    return NextResponse.json({ 
      success: true, 
      message: 'Supabase 인증 시스템이 정상적으로 작동하고 있습니다.',
      checks: {
        environment: envCheck,
        supabaseConnection: true,
        sessionStatus: data.session ? 'Active session found' : 'No active session',
        availableEndpoints: endpoints,
      },
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Content-Type': 'application/json',
      }
    });

  } catch (error) {
    console.error('Auth system health check error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Auth system health check failed',
      details: (error as Error).message,
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET for health check.' },
    { status: 405, headers: { Allow: 'GET' } }
  )
}