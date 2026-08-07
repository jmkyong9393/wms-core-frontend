import { LoginForm } from "@/features/auth/components/LoginForm";
import { LegalFooter } from "@/components/legal-footer";
import { Card } from "@/components/ui/card";

export function LoginView() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 dark:bg-zinc-950">
      <Card className="w-full max-w-sm p-6 sm:p-8">
        <div className="mb-6 text-center">
          <span className="text-lg font-bold bg-gradient-to-r from-brand-from to-brand-to bg-clip-text text-transparent">
            NEWZED
          </span>
          <p className="mt-1 text-sm text-muted-foreground">
            사번과 비밀번호로 로그인해 주세요.
          </p>
        </div>

        <LoginForm />
      </Card>

      <LegalFooter />
    </div>
  );
}
