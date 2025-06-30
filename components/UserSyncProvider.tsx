"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { syncUserWithBackend } from "@/lib/userSync";

interface UserSyncProviderProps {
  children: React.ReactNode;
}

/**
 * Component that automatically syncs Clerk users with backend
 * Place this high in your component tree (e.g., in layout.tsx)
 */
export default function UserSyncProvider({ children }: UserSyncProviderProps) {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    async function handleUserSync() {
      if (!isLoaded || !user) return;

      try {
        // Sync user with backend on login/signup
        await syncUserWithBackend({
          id: user.id,
          emailAddresses: user.emailAddresses,
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
        });
        console.log("User synced with backend successfully");
      } catch (error) {
        console.error("Failed to sync user with backend:", error);
        // You might want to show a toast notification here
      }
    }

    handleUserSync();
  }, [user, isLoaded]);

  return <>{children}</>;
}
