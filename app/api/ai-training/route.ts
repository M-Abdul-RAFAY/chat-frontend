import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    // Get auth info from Clerk
    const { getToken } = await auth();
    const token = await getToken();

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/v1/ai-training/${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      return NextResponse.json({ trainingData: [] });
    }
  } catch (error) {
    console.error("Error fetching AI training data:", error);
    return NextResponse.json({ trainingData: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, trainingData } = await request.json();

    if (!userId || !trainingData) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get auth info from Clerk
    const { getToken } = await auth();
    const token = await getToken();

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/v1/ai-training`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ userId, trainingData }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      throw new Error("Failed to save AI training data");
    }
  } catch (error) {
    console.error("Error saving AI training data:", error);
    return NextResponse.json(
      { error: "Failed to save AI training data" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, trainingData } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/ai-training/${userId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ trainingData }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      throw new Error("Failed to update AI training data");
    }
  } catch (error) {
    console.error("Error updating AI training data:", error);
    return NextResponse.json(
      { error: "Failed to update AI training data" },
      { status: 500 }
    );
  }
}
