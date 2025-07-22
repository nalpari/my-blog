import { useState, useEffect } from 'react'

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
): T {
  const [debouncedCallback, setDebouncedCallback] = useState<T>(() => callback)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCallback(() => callback)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [callback, delay, ...deps])

  return debouncedCallback
}