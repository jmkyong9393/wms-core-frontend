import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { MyPageView } from "@/features/mypage/components/MyPageView";

export default function MyPagePage() {
  return (
    <AuthGuard>
      <MyPageView />
    </AuthGuard>
  );
}
