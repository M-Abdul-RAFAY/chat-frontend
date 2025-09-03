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
      `${process.env.BACKEND_URL}/api/v1/business-info/${userId}`,
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
      return NextResponse.json({ businessInfo: null });
    }
  } catch (error) {
    console.error("Error fetching business info:", error);
    return NextResponse.json({ businessInfo: null });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, businessInfo } = await request.json();

    if (!userId || !businessInfo) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get auth info from Clerk
    const { getToken } = await auth();
    const token = await getToken();

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/v1/business-info`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ userId, businessInfo }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      throw new Error("Failed to save business info");
    }
  } catch (error) {
    console.error("Error saving business info:", error);
    return NextResponse.json(
      { error: "Failed to save business info" },
      { status: 500 }
    );
  }
}
