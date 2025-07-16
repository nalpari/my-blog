import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Supabase 클라이언트 초기화 테스트를 위한 API 엔드포인트
export async function GET() {
  try {
    // Supabase 연결 테스트
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Supabase 클라이언트가 성공적으로 초기화되었습니다.',
      session: data.session ? 'Session exists' : 'No active session'
    });
  } catch (error) {
    console.error('Supabase 클라이언트 테스트 중 오류 발생:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Supabase 클라이언트 초기화 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}