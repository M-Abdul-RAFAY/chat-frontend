import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";

const API_BASE_URL =
  process.env.BACKEND_API_URL || "http://localhost:5000/api/v1";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get the user's authentication from Clerk
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get user from backend using Clerk ID
    const response = await fetch(`${API_BASE_URL}/users/clerk/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.BACKEND_API_KEY || "",
      },
    });

    if (response.status === 404) {
      return res.status(404).json({ error: "User not found in backend" });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Backend request failed: ${response.status} ${response.statusText} - ${
          errorData.error || "Unknown error"
        }`
      );
    }

    const backendUser = await response.json();

    return res.status(200).json({
      success: true,
      user: backendUser,
    });
  } catch (error) {
    console.error("Error fetching user from backend:", error);
    return res.status(500).json({
      error: "Failed to fetch user from backend",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
