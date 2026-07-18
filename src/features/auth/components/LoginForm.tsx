"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "./PasswordInput";
import { isRequiredFieldFilled } from "../utils/validation";
import {
  DEV_MOCK_ROLE_ROUTE,
  resolveDevMockOutcome,
  resolveDevMockRole,
  resolveMustChangePassword,
} from "../utils/devMock";
import type {
  LoginFieldErrors,
  LoginFormStatus,
  LoginFormValues,
} from "../types/authFormTypes";

const MOCK_SUBMIT_DELAY_MS = 700;

export function LoginForm() {
  const router = useRouter();
  const [values, setValues] = useState<LoginFormValues>({
    employee_id: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [status, setStatus] = useState<LoginFormStatus>("idle");
  const [guestPending, setGuestPending] = useState(false);

  const employeeIdRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
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

    const errors: LoginFieldErrors = {};
    if (!isRequiredFieldFilled(values.employee_id)) {
      errors.employee_id = "사번을 입력해 주세요.";
    }
    if (!isRequiredFieldFilled(values.password)) {
      errors.password = "비밀번호를 입력해 주세요.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setStatus("idle");
      if (errors.employee_id) {
        employeeIdRef.current?.focus();
      } else if (errors.password) {
        passwordRef.current?.focus();
      }
      return;
    }

    setFieldErrors({});
    setGuestPending(false);

    // 실제 인증 API가 없으므로 로그인 요청을 실행하지 않음
    if (process.env.NODE_ENV === "production") {
      setStatus("unavailable");
      return;
    }

    // 개발 환경에서만 로그인 성공·실패와 역할별 이동을 mock으로 확인
    setStatus("submitting");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      const outcome = resolveDevMockOutcome() ?? "success";

      if (outcome === "error") {
        setStatus("error");
        return;
      }

      // role 값에 따라 로그인 이후 목적지 결정
      const role = resolveDevMockRole();

      if (role === "GUEST") {
        // 초기 비밀번호 사용 상태이면 이동한 화면에서 권장 팝업 표시
        setStatus("idle");
        setGuestPending(true);
        return;
      }

      const destination = role ? DEV_MOCK_ROLE_ROUTE[role] : undefined;
      if (destination) {
        const suffix = resolveMustChangePassword()
          ? "?must_change_password=true"
          : "";
        router.push(destination + suffix);
        return;
      }

      // role 값이 없으면 화면 이동 없이 기존 로그인 성공 UI만 표시
      setStatus("success");
    }, MOCK_SUBMIT_DELAY_MS);
  };

  const isSubmitting = status === "submitting";

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="employee_id">사번</Label>
        <Input
          id="employee_id"
          ref={employeeIdRef}
          type="text"
          value={values.employee_id}
          onChange={(e) =>
            setValues((v) => ({ ...v, employee_id: e.target.value }))
          }
          autoComplete="username"
          disabled={isSubmitting}
          aria-invalid={!!fieldErrors.employee_id}
          aria-describedby={
            fieldErrors.employee_id ? "employee_id-error" : undefined
          }
        />
        {fieldErrors.employee_id && (
          <p id="employee_id-error" className="text-xs text-red-600 dark:text-red-400">
            {fieldErrors.employee_id}
          </p>
        )}
      </div>

      <PasswordInput
        id="password"
        ref={passwordRef}
        label="비밀번호"
        value={values.password}
        onChange={(value) => setValues((v) => ({ ...v, password: value }))}
        autoComplete="current-password"
        error={fieldErrors.password}
        disabled={isSubmitting}
      />

      {status === "error" && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-600 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
          사번 또는 비밀번호를 확인해 주세요.
        </div>
      )}

      {status === "success" && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-center text-sm text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-400">
          로그인 UI 데모 — 실제 인증은 아직 연결되지 않았습니다.
        </div>
      )}

      {guestPending && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-center text-sm text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-400">
          게스트 전용 화면은 준비 중입니다. 담당자에게 문의해 주세요.
        </div>
      )}

      {status === "unavailable" && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-center text-sm text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-400">
          현재 인증 API 연결 전입니다. 백엔드 연동 후 이용 가능합니다.
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "로그인 중..." : "로그인"}
      </Button>
    </form>
  );
}
