const rtf = new Intl.RelativeTimeFormat('ko', { numeric: 'auto' });

const DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: 'seconds' },
  { amount: 60, unit: 'minutes' },
  { amount: 24, unit: 'hours' },
  { amount: 7, unit: 'days' },
  { amount: 4.34524, unit: 'weeks' },
  { amount: 12, unit: 'months' },
  { amount: Number.POSITIVE_INFINITY, unit: 'years' },
];

// timezone 포함 여부 확인
const TIMEZONE_SUFFIX_PATTERN = /(Z|[+-]\d{2}:?\d{2})$/;

// offset 없는 UTC 시간 보정
function toUtcIsoString(isoTimestamp: string): string {
  return TIMEZONE_SUFFIX_PATTERN.test(isoTimestamp) ? isoTimestamp : `${isoTimestamp}Z`;
}

// 현재 시각 기준 상대 시간 반환
export function formatRelativeTime(isoTimestamp: string): string {
  let duration = (new Date(toUtcIsoString(isoTimestamp)).getTime() - Date.now()) / 1000;

  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return rtf.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }
  return rtf.format(Math.round(duration), 'years');
}
