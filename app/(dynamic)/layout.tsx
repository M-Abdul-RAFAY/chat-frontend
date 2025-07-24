import { ClerkProvider } from "@clerk/nextjs";
import TopNavigation from "@/components/TopNavigation";
import UserSyncProvider from "@/components/UserSyncProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <UserSyncProvider>
        <div className="h-screen flex flex-col overflow-hidden">
          <div className="flex-shrink-0 fixed top-0 left-0 right-0 z-50">
            <TopNavigation />
          </div>
          <main className="flex-1 min-h-0 flex flex-col mt-[3.8rem]">
            {children}
          </main>
        </div>
      </UserSyncProvider>
    </ClerkProvider>
  );
}
