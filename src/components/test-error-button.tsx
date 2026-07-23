'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function TestErrorButton() {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error('의도적으로 발생시킨 테스트 에러입니다! 💣 (TestErrorButton)');
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button 
        variant="destructive"
        onClick={() => setShouldThrow(true)}
        className="shadow-xl rounded-full"
      >
        💥 에러 발생 테스트
      </Button>
    </div>
  );
}
