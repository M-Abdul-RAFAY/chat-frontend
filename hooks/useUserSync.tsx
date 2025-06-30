"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import {
  syncUserWithBackend,
  getUserFromBackend,
  type BackendUser,
} from "@/lib/userSync";

export function useUserSync() {
  const { user, isLoaded } = useUser();
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSynced, setIsSynced] = useState(false);

  useEffect(() => {
    async function syncUser() {
      if (!isLoaded || !user) return;

      setIsLoading(true);
      setError(null);

      try {
        // First try to get user from backend
        try {
          const existingUser = await getUserFromBackend();
          setBackendUser(existingUser);
          setIsSynced(true);
        } catch (error) {
          // User doesn't exist, sync them
          console.log("User not found in backend, syncing...");
          const syncedUser = await syncUserWithBackend({
            id: user.id,
            emailAddresses: user.emailAddresses,
            firstName: user.firstName,
            lastName: user.lastName,
            imageUrl: user.imageUrl,
          });
          setBackendUser(syncedUser);
          setIsSynced(true);
        }
      } catch (error) {
        console.error("Error syncing user:", error);
        setError(
          error instanceof Error ? error.message : "Failed to sync user"
        );
      } finally {
        setIsLoading(false);
      }
    }

    syncUser();
  }, [user, isLoaded]);

  const resyncUser = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const syncedUser = await syncUserWithBackend({
        id: user.id,
        emailAddresses: user.emailAddresses,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
      });
      setBackendUser(syncedUser);
      setIsSynced(true);
    } catch (error) {
      console.error("Error resyncing user:", error);
      setError(
        error instanceof Error ? error.message : "Failed to resync user"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    backendUser,
    isLoading,
    error,
    isSynced,
    resyncUser,
  };
}
