'use client';

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { User, AuthState } from '@/types/supabase';
import logger from '@/lib/logger';

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
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
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
  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      dispatch({ type: 'LOADING', payload: true });
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        dispatch({ type: 'ERROR', payload: error.message });
        return { success: false, error: error.message };
      }

      if (data.user) {
        dispatch({ type: 'LOGIN', payload: mapSupabaseUser(data.user) });
        return { success: true };
      }
      
      // 사용자 데이터가 없는 경우 (드문 케이스)
      dispatch({ type: 'ERROR', payload: '로그인 처리 중 오류가 발생했습니다.' });
      return { success: false, error: '로그인 처리 중 오류가 발생했습니다.' };
    } catch (error) {
      const errorMessage = (error as Error).message;
      dispatch({ type: 'ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // 회원가입
  const signUp = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      dispatch({ type: 'LOADING', payload: true });
      const { data, error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        dispatch({ type: 'ERROR', payload: error.message });
        return { success: false, error: error.message };
      }

      if (data.user) {
        dispatch({ type: 'LOGIN', payload: mapSupabaseUser(data.user) });
        return { success: true };
      }
      
      // 사용자 데이터가 없는 경우 (드문 케이스)
      dispatch({ type: 'ERROR', payload: '회원가입 처리 중 오류가 발생했습니다.' });
      return { success: false, error: '회원가입 처리 중 오류가 발생했습니다.' };
    } catch (error) {
      const errorMessage = (error as Error).message;
      dispatch({ type: 'ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // 로그아웃
  const signOut = async () => {
    try {
      dispatch({ type: 'LOADING', payload: true });

      // API 엔드포인트를 통한 로그아웃
      try {
        const response = await fetch('/api/auth/signout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // 쿠키 포함
        });

        if (!response.ok) {
          const errorData = await response.json();
          logger.warn({ err: errorData.error }, 'Sign out API error:');
          // API 호출 실패해도 계속 진행
        }
      } catch (apiError) {
        logger.warn({ err: apiError }, 'Sign out API call failed:');
        // API 호출 실패해도 계속 진행
      }

      // Supabase 클라이언트 로그아웃 시도
      try {
        await supabase.auth.signOut();
      } catch (supabaseError) {
        logger.warn({ err: supabaseError }, 'Supabase sign out error:');
        // Supabase 로그아웃 실패해도 계속 진행
      }

      // 상태 초기화 (항상 실행)
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      logger.error({ err: error }, 'Signout error:');
      dispatch({ type: 'ERROR', payload: (error as Error).message });
      // 오류가 발생해도 로그아웃 상태로 설정
      dispatch({ type: 'LOGOUT' });
    } finally {
      dispatch({ type: 'LOADING', payload: false });
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
    const checkSession = async () => {
      try {
        dispatch({ type: 'LOADING', payload: true });
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          logger.error({ err: error }, 'Session check error:');
          throw error;
        }

        if (data.session?.user) {
          // 세션이 있으면 로그인 상태로 설정
          dispatch({ type: 'LOGIN', payload: mapSupabaseUser(data.session.user) });
          
          // 세션 만료 시간 확인 및 필요시 갱신
          const currentTime = Math.floor(Date.now() / 1000);
          const expiresAt = data.session.expires_at || 0;
          const timeToExpire = expiresAt - currentTime;
          
          // 개발 환경에서만 로깅
          if (process.env.NODE_ENV !== 'production') {
            logger.info(`Session expires at: ${new Date(expiresAt * 1000).toLocaleString()}, ${timeToExpire}초 남음`);
          }
          
          // 만료 10분 전이거나 이미 만료된 경우 갱신 시도
          if (timeToExpire < 600 || timeToExpire <= 0) {
            if (process.env.NODE_ENV !== 'production') {
              logger.info('Session expiring soon or expired, refreshing...');
            }
            try {
              const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
              
              if (refreshError) {
                logger.error({ err: refreshError }, 'Error refreshing session:');
                // 리프레시 토큰 오류인 경우 로그아웃 처리
                if (refreshError.message.includes('Refresh Token') || 
                    refreshError.message.includes('Invalid Refresh Token')) {
                  logger.warn('Invalid refresh token, signing out');
                  await signOut();
                  return;
                }
              } else if (refreshData.session) {
                if (process.env.NODE_ENV !== 'production') {
                  logger.info('Session refreshed successfully');
                }
                dispatch({ type: 'LOGIN', payload: mapSupabaseUser(refreshData.session.user) });
              }
            } catch (refreshErr) {
              logger.error({ err: refreshErr }, 'Session refresh error:');
            }
          }
        } else {
          // 세션이 없으면 로그아웃 상태로 설정
          dispatch({ type: 'LOGOUT' });
        }
      } catch (error) {
        logger.error({ err: error }, 'Session check exception:');
        dispatch({ type: 'ERROR', payload: (error as Error).message });
        dispatch({ type: 'LOGOUT' });
      } finally {
        dispatch({ type: 'LOADING', payload: false });
      }
    };

    // 초기 세션 확인
    checkSession();
    
    // 주기적으로 세션 확인 (10분마다)
    const sessionCheckInterval = setInterval(checkSession, 10 * 60 * 1000);

    // 인증 상태 변경 리스너 설정
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (process.env.NODE_ENV !== 'production') {
          logger.info(`Auth event: ${event}`);
        }
        
        if (event === 'SIGNED_IN' && session?.user) {
          dispatch({ type: 'LOGIN', payload: mapSupabaseUser(session.user) });
        } else if (event === 'SIGNED_OUT') {
          dispatch({ type: 'LOGOUT' });
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          if (process.env.NODE_ENV !== 'production') {
            logger.info('Token refreshed event received');
          }
          dispatch({ type: 'LOGIN', payload: mapSupabaseUser(session.user) });
        }
      }
    );

    // 컴포넌트 언마운트 시 리스너 및 인터벌 제거
    return () => {
      clearInterval(sessionCheckInterval);
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