export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: Record<string, never> | {
      // 여기에 데이터베이스 테이블 타입을 정의합니다.
      // 예시:
      // users: {
      //   Row: {
      //     id: string;
      //     email: string;
      //     created_at: string;
      //     last_sign_in_at: string | null;
      //   };
      //   Insert: {
      //     id?: string;
      //     email: string;
      //     created_at?: string;
      //     last_sign_in_at?: string | null;
      //   };
      //   Update: {
      //     id?: string;
      //     email?: string;
      //     created_at?: string;
      //     last_sign_in_at?: string | null;
      //   };
      // };
    };
    Views: Record<string, never> | {
      // 여기에 데이터베이스 뷰 타입을 정의합니다.
    };
    Functions: Record<string, never> | {
      // 여기에 데이터베이스 함수 타입을 정의합니다.
    };
    Enums: Record<string, never> | {
      // 여기에 데이터베이스 열거형 타입을 정의합니다.
    };
  };
}

// 사용자 타입 정의
export interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
}

// 인증 상태 타입 정의
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}