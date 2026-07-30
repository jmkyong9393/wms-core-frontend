import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { formatRelativeTime } from './formatRelativeTime';

const ORIGINAL_TZ = process.env.TZ;

describe('formatRelativeTime', () => {
  beforeEach(() => {
    // KST 환경으로 고정
    process.env.TZ = 'Asia/Seoul';

    // 현재 시각 고정
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:10:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();

    // 기존 타임존 복원
    if (ORIGINAL_TZ === undefined) {
      delete process.env.TZ;
    } else {
      process.env.TZ = ORIGINAL_TZ;
    }
  });

  it('treats a naive UTC timestamp (no Z, no offset) as UTC rather than local time', () => {
    // offset 없는 UTC 시간 처리
    expect(formatRelativeTime('2026-01-01T00:05:00.000000')).toBe('5분 전');
  });

  it('still correctly handles a timestamp that already ends in Z (regression)', () => {
    // Z가 포함된 UTC 시간 처리
    expect(formatRelativeTime('2026-01-01T00:05:00.000Z')).toBe('5분 전');
  });

  it('still correctly handles a timestamp with an explicit +09:00 offset (regression)', () => {
    // 양수 offset 시간 처리
    expect(formatRelativeTime('2026-01-01T09:05:00.000+09:00')).toBe('5분 전');
  });

  it('still correctly handles a timestamp with an explicit -05:00 offset (regression)', () => {
    // 음수 offset 시간 처리
    expect(formatRelativeTime('2025-12-31T19:05:00.000-05:00')).toBe('5분 전');
  });
});
