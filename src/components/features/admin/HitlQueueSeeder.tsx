'use client';

import { useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { hitlQueueAtom } from '@/stores/atoms';
import { mockHitlQueueSeed } from './mockHitlQueueSeed';

export default function HitlQueueSeeder() {
  const setQueue = useSetAtom(hitlQueueAtom);

  // 검토 목록이 비어 있으면 데모용 데이터를 추가
  useEffect(() => {
    setQueue((prev) => (prev.length === 0 ? mockHitlQueueSeed : prev));
  }, [setQueue]);

  // 화면에는 표시하지 않고 상태만 초기화
  return null;
}
