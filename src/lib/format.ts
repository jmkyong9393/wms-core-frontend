// 원화 금액 포맷 (예: 13500 -> "13,500원")
export function formatCurrencyKRW(value: number | string): string {
  const numeric = typeof value === 'string' ? Number(value) : value;
  return `${numeric.toLocaleString('ko-KR')}원`;
}

// 소수 할인율(0~1)을 퍼센트 문자열로 변환 (예: 0.1 -> "10%")
export function formatDiscountRate(rate: number | string): string {
  const numeric = typeof rate === 'string' ? Number(rate) : rate;
  return `${(numeric * 100).toFixed(1).replace(/\.0$/, '')}%`;
}
