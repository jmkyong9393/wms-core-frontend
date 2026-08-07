"use client";

import { useState } from "react";
import { ChangePasswordForm } from "@/features/auth/components/ChangePasswordForm";
import { ChangePasswordSteps } from "@/features/auth/components/ChangePasswordSteps";
import { PrivacyConsentStep } from "@/features/auth/components/PrivacyConsentStep";

export function ChangePasswordView() {
  const [step, setStep] = useState<"consent" | "password">("consent");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-zinc-950">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6 text-center">
          <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            NEWZED
          </span>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
            {step === "consent"
              ? "계속 진행하기 전에 아래 내용을 확인해 주세요."
              : "현재 비밀번호를 확인한 후 새 비밀번호로 변경할 수 있습니다."}
          </p>
        </div>

        <ChangePasswordSteps current={step} />

        {step === "consent" ? (
          <PrivacyConsentStep onAgree={() => setStep("password")} />
        ) : (
          <ChangePasswordForm />
        )}
      </div>
    </div>
  );
}
