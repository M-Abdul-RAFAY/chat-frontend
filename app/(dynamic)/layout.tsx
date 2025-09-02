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
        <div className="min-h-screen flex flex-col">
          <div className="flex-shrink-0 fixed top-0 left-0 right-0 z-50">
            <TopNavigation />
          </div>
          <main className="flex-1 pt-[3.8rem]">{children}</main>
        </div>
      </UserSyncProvider>
    </ClerkProvider>
  );
}
