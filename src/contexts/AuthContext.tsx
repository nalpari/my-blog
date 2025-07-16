'use client';

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { User, AuthState } from '@/types/supabase';

// 인증 액션 타입 정의
type AuthAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'LOADING'; payload: boolean }
  | { type: 'ERROR'; payload: string | null };

// 초기 인증 상태
const initialState: AuthState = {
  user: null,
  loading: true,
  error: null,
};

// 인증 상태 리듀서
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload,
        loading: false,
        error: null,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        loading: false,
        error: null,
      };
    case 'LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    default:
      return state;
  }
}

// AuthContext 인터페이스 정의
interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// AuthContext 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider 컴포넌트 props 타입 정의
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider 컴포넌트 구현
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Supabase 사용자 데이터를 User 타입으로 변환하는 함수
  const mapSupabaseUser = (supabaseUser: SupabaseUser): User => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      created_at: supabaseUser.created_at || new Date().toISOString(),
      last_sign_in_at: supabaseUser.last_sign_in_at || null,
    };
  };

  // 이메일/비밀번호로 로그인
  const signIn = async (email: string, password: string) => {
    try {
      dispatch({ type: 'LOADING', payload: true });
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }

      if (data.user) {
        dispatch({ type: 'LOGIN', payload: mapSupabaseUser(data.user) });
      }
    } catch (error) {
      dispatch({ type: 'ERROR', payload: (error as Error).message });
    }
  };

  // 회원가입
  const signUp = async (email: string, password: string) => {
    try {
      dispatch({ type: 'LOADING', payload: true });
      const { data, error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        throw error;
      }

      if (data.user) {
        dispatch({ type: 'LOGIN', payload: mapSupabaseUser(data.user) });
      }
    } catch (error) {
      dispatch({ type: 'ERROR', payload: (error as Error).message });
    }
  };

  // 로그아웃
  const signOut = async () => {
    try {
      dispatch({ type: 'LOADING', payload: true });
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      dispatch({ type: 'ERROR', payload: (error as Error).message });
    }
  };

  // 비밀번호 재설정 이메일 전송
  const resetPassword = async (email: string) => {
    try {
      dispatch({ type: 'LOADING', payload: true });
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }

      dispatch({ type: 'LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'ERROR', payload: (error as Error).message });
    }
  };

  // 초기 세션 확인 및 인증 상태 변경 리스너 설정
  useEffect(() => {
    // 현재 세션 확인
    const checkSession = async () => {
      try {
        dispatch({ type: 'LOADING', payload: true });
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (data.session?.user) {
          dispatch({ type: 'LOGIN', payload: mapSupabaseUser(data.session.user) });
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      } catch (error) {
        dispatch({ type: 'ERROR', payload: (error as Error).message });
        dispatch({ type: 'LOGOUT' });
      }
    };

    // 초기 세션 확인
    checkSession();

    // 인증 상태 변경 리스너 설정
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          dispatch({ type: 'LOGIN', payload: mapSupabaseUser(session.user) });
        } else if (event === 'SIGNED_OUT') {
          dispatch({ type: 'LOGOUT' });
        }
      }
    );

    // 컴포넌트 언마운트 시 리스너 제거
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Context 값 정의
  const contextValue: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// useAuth 커스텀 훅
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}