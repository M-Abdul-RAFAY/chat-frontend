import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";

interface UserData {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
}

interface BackendUserResponse {
  id: number;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const API_BASE_URL =
  process.env.BACKEND_API_URL || "http://localhost:4000/api/v1";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get the user's authentication from Clerk
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { userData } = req.body as { userData: UserData };

    if (!userData || !userData.clerkId || !userData.email) {
      return res.status(400).json({ error: "Missing required user data" });
    }

    // Send user data to backend to create/update user
    const response = await fetch(`${API_BASE_URL}/users/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // You might want to add API key authentication here
        "X-API-Key": process.env.BACKEND_API_KEY || "",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Backend sync failed: ${response.status} ${response.statusText} - ${errorData.error || "Unknown error"
        }`
      );
    }

    const backendUser: BackendUserResponse = await response.json();

    return res.status(200).json({
      success: true,
      user: backendUser,
    });
  } catch (error) {
    console.error("Error syncing user with backend:", error);
    return res.status(500).json({
      error: "Failed to sync user with backend",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
