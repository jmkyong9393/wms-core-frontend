import MainLayout from "@/components/layout/MainLayout";
import HitlQueueSeeder from "@/features/queue/components/HitlQueueSeeder";
import HitlActionErrorToast from "@/features/queue/components/HitlActionErrorToast";
import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { NotificationStreamProvider } from "@/features/notifications/components/NotificationStreamProvider";
import { NotificationToastContainer } from "@/features/notifications/components/NotificationToastContainer";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard allow={["MASTER", "ADMIN"]}>
      <HitlQueueSeeder />
      <HitlActionErrorToast />
      <NotificationStreamProvider />
      <NotificationToastContainer />
      <MainLayout>{children}</MainLayout>
    </AuthGuard>
  );
}
