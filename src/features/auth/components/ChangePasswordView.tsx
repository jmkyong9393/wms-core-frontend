"use client";

import { useState } from "react";
import { ChangePasswordForm } from "@/features/auth/components/ChangePasswordForm";
import { ChangePasswordSteps } from "@/features/auth/components/ChangePasswordSteps";
import { PrivacyConsentStep } from "@/features/auth/components/PrivacyConsentStep";
import { Card } from "@/components/ui/card";

export function ChangePasswordView() {
  const [step, setStep] = useState<"consent" | "password">("consent");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-zinc-950">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <div className="mb-6 text-center">
          <span className="text-lg font-bold bg-gradient-to-r from-brand-from to-brand-to bg-clip-text text-transparent">
            NEWZED
          </span>
          <p className="mt-1 text-sm text-muted-foreground">
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
      </Card>
    </div>
  );
}
