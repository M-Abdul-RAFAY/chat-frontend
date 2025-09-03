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
      `${process.env.BACKEND_URL}/api/user-settings`,
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
      // Return default settings if none found
      return NextResponse.json({
        aiGeneratedResponse: true,
        whatsapp: false,
        sms: true,
      });
    }
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return NextResponse.json({
      aiGeneratedResponse: true,
      whatsapp: false,
      sms: true,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...settings } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get auth info from Clerk
    const { getToken } = await auth();
    const token = await getToken();

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/user-settings`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ userId, ...settings }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      throw new Error("Failed to save user settings");
    }
  } catch (error) {
    console.error("Error saving user settings:", error);
    return NextResponse.json(
      { error: "Failed to save user settings" },
      { status: 500 }
    );
  }
}
