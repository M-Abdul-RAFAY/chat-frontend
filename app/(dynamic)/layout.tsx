import TopNavigation from "@/components/TopNavigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased h-screen flex flex-col overflow-hidden">
        <div className="flex-shrink-0 fixed top-0 left-0 right-0 z-50">
          <TopNavigation />
        </div>
        <main className="flex-1 min-h-0 flex flex-col  mt-[3.8rem]">
          {children}
        </main>
      </body>
    </html>
  );
}
