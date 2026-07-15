export default function InboundLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 font-sans">
      <header className="sticky top-0 z-30 h-14 flex items-center px-4 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
        <h1 className="text-base font-semibold text-gray-800 dark:text-zinc-100">
          현장 반품 검수
        </h1>
      </header>
      <main className="flex flex-col items-center p-4">{children}</main>
    </div>
  );
}
