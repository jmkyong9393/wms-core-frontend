// 이름의 마지막 글자를 *로 마스킹 (예: 박준희 → 박준*)
export function maskName(name: string): string {
  if (name.length <= 1) return "*";
  return `${name.slice(0, -1)}*`;
}
