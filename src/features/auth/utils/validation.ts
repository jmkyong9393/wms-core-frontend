export function isRequiredFieldFilled(value: string): boolean {
  return value.trim().length > 0;
}

export function doPasswordsMatch(a: string, b: string): boolean {
  return a.length > 0 && a === b;
}

export const PASSWORD_RULE_MESSAGE =
  "영문, 숫자, 특수문자 중 2가지 이상을 조합하여 8자 이상 입력해 주세요.";

const PASSWORD_CATEGORY_PATTERNS = [/[A-Za-z]/, /[0-9]/, /[^A-Za-z0-9\s]/];

export function isPasswordRuleSatisfied(password: string): boolean {
  if (password.length < 8) return false;
  const matchedCategories = PASSWORD_CATEGORY_PATTERNS.filter((pattern) =>
    pattern.test(password)
  ).length;
  return matchedCategories >= 2;
}
