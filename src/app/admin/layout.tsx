import MainLayout from "@/components/layout/MainLayout";
import HitlQueueSeeder from "@/features/queue/components/HitlQueueSeeder";
import HitlActionErrorToast from "@/features/queue/components/HitlActionErrorToast";
import { AuthGuard } from "@/features/auth/components/AuthGuard";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard allow={["MASTER", "ADMIN"]}>
      <HitlQueueSeeder />
      <HitlActionErrorToast />
      <MainLayout>{children}</MainLayout>
    </AuthGuard>
  );
}
