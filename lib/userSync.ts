// Utility functions for syncing Clerk users with backend

export interface ClerkUser {
  id: string;
  emailAddresses: Array<{ emailAddress: string }>;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
}

export interface BackendUser {
  id: number;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Sync a Clerk user with the backend
 * This should be called after user signs up or when user data changes
 */
export async function syncUserWithBackend(
  clerkUser: ClerkUser
): Promise<BackendUser> {
  const userData = {
    clerkId: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    imageUrl: clerkUser.imageUrl,
  };

  console.log("Syncing user with backend:", userData);

  const response = await fetch("/api/auth/sync-user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userData }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Failed to sync user: ${error.error || "Unknown error"}`);
  }

  const result = await response.json();
  return result.user;
}

/**
 * Get user data from backend
 */
export async function getUserFromBackend(): Promise<BackendUser> {
  const response = await fetch("/api/auth/get-user", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Failed to get user: ${error.error || "Unknown error"}`);
  }

  const result = await response.json();
  return result.user;
}

/**
 * Check if user exists in backend, if not sync them
 */
export async function ensureUserInBackend(
  clerkUser: ClerkUser
): Promise<BackendUser> {
  try {
    // Try to get user from backend first
    return await getUserFromBackend();
  } catch (error) {
    // If user doesn't exist, sync them
    console.log("User not found in backend, syncing...");
    return await syncUserWithBackend(clerkUser);
  }
}
