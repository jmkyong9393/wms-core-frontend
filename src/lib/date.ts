// 백엔드가 타임존 표시 없이 내려주는 날짜/시간 문자열(실제로는 UTC)을 올바르게 파싱
export function parseBackendUtc(value: string): Date {
  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/.test(value);
  return new Date(hasTimezone ? value : `${value}Z`);
}

export function formatKstDateTime(value: string): string {
  return parseBackendUtc(value).toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 날짜만 표시하는 테이블/상세 항목용 (YYYY-MM-DD)
export function formatKstDate(value: string): string {
  return parseBackendUtc(value).toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
}

// 시:분:초만 표시하는 항목용
export function formatKstTime(value: string): string {
  return parseBackendUtc(value).toLocaleTimeString('ko-KR', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
