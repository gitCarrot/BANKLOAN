'use client';

import { useState } from 'react';
import { testServerAction } from './actions';

export default function TestServerActionPage() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleTestAction = async () => {
    try {
      setError(null);
      const data = await testServerAction();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">서버 액션 테스트</h1>
      
      <button 
        onClick={handleTestAction}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        서버 액션 테스트
      </button>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <h2 className="font-bold">오류 발생:</h2>
          <pre className="mt-2 whitespace-pre-wrap">{error}</pre>
        </div>
      )}
      
      {result && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <h2 className="font-bold">결과:</h2>
          <pre className="mt-2 whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  );
} 