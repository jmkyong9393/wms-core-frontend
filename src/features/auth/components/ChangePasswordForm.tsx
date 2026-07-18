"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "./PasswordInput";
import { doPasswordsMatch, isRequiredFieldFilled } from "../utils/validation";
import { resolveDevMockOutcome } from "../utils/devMock";
import type {
  ChangePasswordFieldErrors,
  ChangePasswordFormStatus,
  ChangePasswordFormValues,
} from "../types/authFormTypes";

const MOCK_SUBMIT_DELAY_MS = 700;

export function ChangePasswordForm() {
  const [values, setValues] = useState<ChangePasswordFormValues>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState<ChangePasswordFieldErrors>({});
  const [status, setStatus] = useState<ChangePasswordFormStatus>("idle");

  const currentPasswordRef = useRef<HTMLInputElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors: ChangePasswordFieldErrors = {};
    if (!isRequiredFieldFilled(values.currentPassword)) {
      errors.currentPassword = "현재 비밀번호를 입력해 주세요.";
    }
    if (!isRequiredFieldFilled(values.newPassword)) {
      errors.newPassword = "새 비밀번호를 입력해 주세요.";
    }
    if (!isRequiredFieldFilled(values.confirmPassword)) {
      errors.confirmPassword = "새 비밀번호 확인을 입력해 주세요.";
    }
    if (
      !errors.newPassword &&
      !errors.confirmPassword &&
      !doPasswordsMatch(values.newPassword, values.confirmPassword)
    ) {
      errors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setStatus("idle");
      if (errors.currentPassword) {
        currentPasswordRef.current?.focus();
      } else if (errors.newPassword) {
        newPasswordRef.current?.focus();
      } else if (errors.confirmPassword) {
        confirmPasswordRef.current?.focus();
      }
      return;
    }

    setFieldErrors({});

    // 운영 환경에서는 실제 인증 API가 없으므로 변경 요청을 실행하지 않음
    if (process.env.NODE_ENV === "production") {
      setStatus("unavailable");
      return;
    }

    // 개발 환경에서만 제출 중·성공·실패 상태를 mock으로 확인
    setStatus("submitting");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      const outcome = resolveDevMockOutcome() ?? "success";
      setStatus(outcome);
    }, MOCK_SUBMIT_DELAY_MS);
  };

  const isSubmitting = status === "submitting";

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <PasswordInput
        id="currentPassword"
        ref={currentPasswordRef}
        label="현재 비밀번호"
        value={values.currentPassword}
        onChange={(value) =>
          setValues((v) => ({ ...v, currentPassword: value }))
        }
        autoComplete="current-password"
        error={fieldErrors.currentPassword}
        disabled={isSubmitting}
      />

      <PasswordInput
        id="newPassword"
        ref={newPasswordRef}
        label="새 비밀번호"
        value={values.newPassword}
        onChange={(value) => setValues((v) => ({ ...v, newPassword: value }))}
        autoComplete="new-password"
        error={fieldErrors.newPassword}
        disabled={isSubmitting}
      />

      <PasswordInput
        id="confirmPassword"
        ref={confirmPasswordRef}
        label="새 비밀번호 확인"
        value={values.confirmPassword}
        onChange={(value) =>
          setValues((v) => ({ ...v, confirmPassword: value }))
        }
        autoComplete="new-password"
        error={fieldErrors.confirmPassword}
        disabled={isSubmitting}
      />

      {status === "error" && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-600 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
          비밀번호 변경에 실패했습니다. 다시 시도해 주세요.
        </div>
      )}

      {status === "success" && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-center text-sm text-green-700 dark:border-green-900/30 dark:bg-green-950/20 dark:text-green-400">
          비밀번호 변경 UI 데모 — 실제 저장은 아직 연결되지 않았습니다.
        </div>
      )}

      {status === "unavailable" && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-center text-sm text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-400">
          현재 인증 API 연결 전입니다. 백엔드 연동 후 이용 가능합니다.
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "변경 중..." : "비밀번호 변경"}
      </Button>
    </form>
  );
}
