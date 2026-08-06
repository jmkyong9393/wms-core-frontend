import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { SettingsView } from "@/features/mypage/components/SettingsView";

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsView />
    </AuthGuard>
  );
}
