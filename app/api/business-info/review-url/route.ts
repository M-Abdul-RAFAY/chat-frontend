import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    // Get auth info from Clerk
    const { getToken } = await auth();
    const token = await getToken();

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/v1/business-info/review-url`,
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
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Failed to get review URL" },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error("Error fetching review URL:", error);
    return NextResponse.json(
      { error: "Failed to fetch review URL" },
      { status: 500 }
    );
  }
}
