"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getAuthHeaders } from "@/lib/api";

function GoogleCallbackContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      if (!searchParams) return;

      const code = searchParams.get("code");
      const error = searchParams.get("error");

      if (error) {
        // Send error to parent window
        window.opener?.postMessage(
          {
            type: "GOOGLE_AUTH_ERROR",
            error: error,
          },
          window.location.origin
        );
        window.close();
        return;
      }

      if (code) {
        try {
          // Exchange code for access token
          const API_BASE =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

          const response = await fetch(
            `${API_BASE}/gbp-locations/auth/google-callback`,
            {
              method: "POST",
              headers: {
                ...(await getAuthHeaders()),
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ code }),
            }
          );

          if (!response.ok) {
            throw new Error(`Failed to exchange code: ${response.statusText}`);
          }

          const { accessToken } = await response.json();

          // Send success to parent window
          window.opener?.postMessage(
            {
              type: "GOOGLE_AUTH_SUCCESS",
              accessToken,
            },
            window.location.origin
          );

          window.close();
        } catch (err) {
          console.error("Callback error:", err);
          window.opener?.postMessage(
            {
              type: "GOOGLE_AUTH_ERROR",
              error:
                err instanceof Error ? err.message : "Authentication failed",
            },
            window.location.origin
          );
          window.close();
        }
      }
    };

    handleCallback();
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Processing Google authentication...</p>
      </div>
    </div>
  );
}

export default function GoogleCallback() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
