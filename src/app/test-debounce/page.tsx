'use client';

import { useState } from 'react';
import { useDebouncedCallback } from '@/hooks/useDebounce';

export default function TestDebouncePage() {
  const [inputValue, setInputValue] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');
  const [callCount, setCallCount] = useState(0);
  const [lastCalledTime, setLastCalledTime] = useState<string>('');

  // useDebouncedCallback 훅 테스트
  const debouncedCallback = useDebouncedCallback(
    (value: string) => {
      setDebouncedValue(value);
      setCallCount(prev => prev + 1);
      setLastCalledTime(new Date().toLocaleTimeString());
    },
    500, // 500ms 지연
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedCallback(value);
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">useDebouncedCallback 테스트</h1>
      
      <div className="mb-4">
        <label htmlFor="input" className="block text-sm font-medium mb-2">
          입력값 (빠르게 타이핑해보세요)
        </label>
        <input
          id="input"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
          placeholder="여기에 입력하세요..."
        />
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <div className="mb-2">
          <span className="font-medium">현재 입력값:</span> {inputValue}
        </div>
        <div className="mb-2">
          <span className="font-medium">디바운스된 값:</span> {debouncedValue}
        </div>
        <div className="mb-2">
          <span className="font-medium">콜백 호출 횟수:</span> {callCount}
        </div>
        <div>
          <span className="font-medium">마지막 호출 시간:</span> {lastCalledTime || '아직 호출되지 않음'}
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p>이 페이지는 useDebouncedCallback 훅을 테스트합니다.</p>
        <p>입력 필드에 빠르게 타이핑하면 콜백이 지연되어 실행되는 것을 확인할 수 있습니다.</p>
        <p>콜백은 마지막 입력 후 500ms가 지난 후에만 실행됩니다.</p>
      </div>
    </div>
  );
}