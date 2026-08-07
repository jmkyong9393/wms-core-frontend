interface ChangePasswordStepsProps {
  current: "consent" | "password";
}

export function ChangePasswordSteps({ current }: ChangePasswordStepsProps) {
  const steps = [
    { key: "consent", label: "1. 개인정보 동의" },
    { key: "password", label: "2. 비밀번호 변경" },
  ] as const;

  return (
    <p className="mb-4 flex items-center justify-center gap-1.5 text-xs text-gray-400 dark:text-zinc-500">
      {steps.map((step, index) => (
        <span key={step.key} className="flex items-center gap-1.5">
          <span
            className={
              step.key === current
                ? "font-semibold text-blue-600 dark:text-blue-400"
                : undefined
            }
          >
            {step.label}
          </span>
          {index < steps.length - 1 && <span aria-hidden>›</span>}
        </span>
      ))}
    </p>
  );
}
