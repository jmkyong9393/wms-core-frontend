import MainLayout from "@/components/layout/MainLayout";
import HitlQueueSeeder from "@/features/queue/components/HitlQueueSeeder";
import HitlActionErrorToast from "@/features/queue/components/HitlActionErrorToast";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <HitlQueueSeeder />
      <HitlActionErrorToast />
      <MainLayout>{children}</MainLayout>
    </>
  );
}
