"use client";

import { useState, useEffect } from "react";
import MessagingApp from "@/components/messagingApp";

interface ConnectionStatus {
  facebook_connected: boolean;
  instagram_connected: boolean;
  page_id?: string;
  instagram_account_id?: string;
}

const SocialMediaPage = () => {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  // Check connection status on load
  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await fetch("http://localhost:4000/status");
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      console.error("Failed to check status:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    setConnecting(true);
    const fbAppId = process.env.NEXT_PUBLIC_FB_APP_ID || "1442659767055424";
    const redirectUri =
      process.env.NEXT_PUBLIC_FB_REDIRECT_URI ||
      "http://localhost:4000/auth/callback";
    const scope = [
      "pages_manage_posts",
      "pages_read_engagement",
      "pages_manage_engagement",
      "pages_show_list",
      "pages_messaging",
      "instagram_basic",
      "instagram_manage_comments",
      "instagram_manage_insights",
    ].join(",");

    window.location.href =
      `https://www.facebook.com/v23.0/dialog/oauth?client_id=${fbAppId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${scope}`;
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-3.8rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking connection status...</p>
        </div>
      </div>
    );
  }

  // If not connected to Meta, show connection interface
  if (!status?.facebook_connected) {
    return (
      <div className="h-[calc(100vh-3.8rem)] overflow-y-auto w-full">
        <div className="max-w-4xl mx-auto p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Social Media Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Connect your Facebook Page & Instagram to manage messages and
              comments
            </p>
          </div>

          {/* Connection Status Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <span className="mr-2">📊</span>
              Connection Status
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <span className="mr-3 text-2xl">📘</span>
                  <span className="font-medium">Facebook</span>
                </div>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  ❌ Not Connected
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <span className="mr-3 text-2xl">📷</span>
                  <span className="font-medium">Instagram</span>
                </div>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  ❌ Not Connected
                </span>
              </div>
            </div>

            <button
              onClick={checkStatus}
              className="mt-4 px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              🔄 Refresh Status
            </button>
          </div>

          {/* Connect Button */}
          <div className="text-center mb-8">
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="px-8 py-4 text-lg font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
            >
              {connecting ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Connecting...
                </>
              ) : (
                <>
                  <span className="mr-2">🔗</span>
                  Connect Facebook & Instagram
                </>
              )}
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <span className="mr-2">📋</span>
              How to Connect
            </h3>
            <ol className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="font-bold mr-2 text-blue-600">1.</span>
                Click the &quot;Connect Facebook &amp; Instagram&quot; button
                above
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2 text-blue-600">2.</span>
                Login with your Facebook account that manages your business page
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2 text-blue-600">3.</span>
                Grant permissions for your Facebook Page
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2 text-blue-600">4.</span>
                You&apos;ll be redirected back and can start managing messages
              </li>
            </ol>

            <div className="mt-4 p-4 bg-white rounded-md border-l-4 border-blue-400">
              <h4 className="font-semibold text-blue-800 mb-2">
                Requirements:
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>
                  • You need a Facebook Business Page (not personal profile)
                </li>
                <li>
                  • For Instagram: Connect your Instagram Business Account to
                  your Facebook Page
                </li>
                <li>
                  • Backend server must be running on http://localhost:4000
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If connected, show the messaging app
  return (
    <div className="h-[calc(100vh-3.8rem)] overflow-y-auto w-full">
      {/* Connected Status Header */}
      <div className="bg-green-50 border-b border-green-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="text-green-600 mr-2">✅</span>
              <span className="font-medium text-green-800">
                Facebook Connected
              </span>
              {status.page_id && (
                <span className="ml-2 text-sm text-green-600">
                  (Page ID: {status.page_id})
                </span>
              )}
            </div>
            {status.instagram_connected && (
              <div className="flex items-center">
                <span className="text-green-600 mr-2">✅</span>
                <span className="font-medium text-green-800">
                  Instagram Connected
                </span>
                {status.instagram_account_id && (
                  <span className="ml-2 text-sm text-green-600">
                    (ID: {status.instagram_account_id})
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            onClick={checkStatus}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <MessagingApp />
    </div>
  );
};

export default SocialMediaPage;
