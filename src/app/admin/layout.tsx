import MainLayout from "@/components/layout/MainLayout";
import HitlQueueSeeder from "@/features/queue/components/HitlQueueSeeder";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <HitlQueueSeeder />
      <MainLayout>{children}</MainLayout>
    </>
  );
}
