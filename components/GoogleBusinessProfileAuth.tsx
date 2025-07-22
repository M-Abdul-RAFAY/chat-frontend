"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, CheckCircle, AlertCircle } from "lucide-react";
import { getAuthHeaders } from "@/lib/api";

interface GoogleBusinessProfileAuthProps {
  onTokenReceived: (token: string) => void;
  className?: string;
}

export function GoogleBusinessProfileAuth({
  onTokenReceived,
  className = "",
}: GoogleBusinessProfileAuthProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

  const handleConnectGoogle = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      // Step 1: Get the Google OAuth URL from backend
      const response = await fetch(
        `${API_BASE}/gbp-locations/auth/google-url`,
        {
          headers: await getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to get Google OAuth URL: ${response.statusText}`
        );
      }

      const { authUrl } = await response.json();

      // Step 2: Open Google OAuth in a popup window
      const popup = window.open(
        authUrl,
        "googleAuth",
        "width=500,height=600,scrollbars=yes,resizable=yes"
      );

      if (!popup) {
        throw new Error(
          "Failed to open popup window. Please allow popups for this site."
        );
      }

      // Step 3: Listen for the OAuth callback
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setIsConnecting(false);
        }
      }, 1000);

      // Listen for messages from the popup (if we implement postMessage)
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === "GOOGLE_AUTH_SUCCESS") {
          const { accessToken } = event.data;
          setIsConnected(true);
          onTokenReceived(accessToken);
          popup.close();
          clearInterval(checkClosed);
          window.removeEventListener("message", handleMessage);
        } else if (event.data.type === "GOOGLE_AUTH_ERROR") {
          setError(event.data.error || "Authentication failed");
          popup.close();
          clearInterval(checkClosed);
          window.removeEventListener("message", handleMessage);
        }
      };

      window.addEventListener("message", handleMessage);
    } catch (err) {
      console.error("Google Auth Error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to connect to Google"
      );
    } finally {
      setIsConnecting(false);
    }
  };

  if (isConnected) {
    return (
      <div className={`flex items-center gap-2 text-green-600 ${className}`}>
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm font-medium">
          Connected to Google Business Profile
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
        <Button
          onClick={handleConnectGoogle}
          disabled={isConnecting}
          variant="outline"
          size="sm"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-sm text-gray-600">
        To sync reviews, connect your Google Business Profile:
      </p>
      <Button
        onClick={handleConnectGoogle}
        disabled={isConnecting}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        {isConnecting ? (
          "Connecting..."
        ) : (
          <>
            <ExternalLink className="h-4 w-4" />
            Connect Google Business Profile
          </>
        )}
      </Button>
    </div>
  );
}
