import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * 디바운스 훅 - 입력값의 변경을 지연시켜 불필요한 API 호출을 방지
 * @param value 디바운스할 값
 * @param delay 지연 시간 (밀리초)
 * @returns 디바운스된 값
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // 지연 시간 후에 값을 업데이트하는 타이머 설정
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // 값이 변경되면 이전 타이머를 정리하고 새로운 타이머 설정
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * 디바운스된 콜백 훅 - 함수 호출을 지연시킴
 * @param callback 실행할 콜백 함수
 * @param delay 지연 시간 (밀리초)
 * @param deps 의존성 배열
 * @returns 디바운스된 콜백 함수
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): (...args: Parameters<T>) => void {
  // 타이머 ID를 저장할 ref
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  // 원본 콜백 함수를 저장할 ref
  const callbackRef = useRef<T>(callback)
  
  // 콜백이 변경되면 ref 업데이트
  useEffect(() => {
    callbackRef.current = callback
  }, [callback, ...deps])
  
  // 디바운스된 콜백 함수 생성
  return useCallback((...args: Parameters<T>) => {
    // 이전 타이머가 있으면 취소
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    
    // 새로운 타이머 설정
    timerRef.current = setTimeout(() => {
      // ref에서 최신 콜백 함수 가져와서 실행
      callbackRef.current(...args)
    }, delay)
  }, [delay]) as (...args: Parameters<T>) => void
}