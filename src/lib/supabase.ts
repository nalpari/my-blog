import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// 환경 변수에서 Supabase URL과 익명 키를 가져옵니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 환경 변수가 설정되어 있는지 확인합니다.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL 또는 익명 키가 설정되지 않았습니다. .env.local 파일을 확인해주세요.');
}

// Supabase 클라이언트를 생성합니다.
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'supabase-auth',
    storage: {
      getItem: (key) => {
        if (typeof window !== 'undefined') {
          return window.localStorage.getItem(key);
        }
        return null;
      },
      setItem: (key, value) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, value);
        }
      },
      removeItem: (key) => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key);
        }
      },
    },
  },
});