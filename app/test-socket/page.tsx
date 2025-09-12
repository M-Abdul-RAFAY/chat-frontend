"use client";

import { useEffect, useState } from "react";
import {
  initializeSocket,
  getSocket,
  onNewFacebookMessage,
  offNewFacebookMessage,
} from "@/lib/socket";

export default function TestSocketPage() {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");

  useEffect(() => {
    console.log("🧪 Test Socket Page: Initializing socket connection...");

    // Initialize socket without token for testing
    initializeSocket();

    const socket = getSocket();
    if (socket) {
      // Connect to socket
      socket.connect();

      // Set up connection event listeners
      const handleConnect = () => {
        console.log("✅ Socket connected successfully:", socket.id);
        setConnected(true);
        setConnectionStatus(`Connected: ${socket.id}`);
      };

      const handleDisconnect = (reason: string) => {
        console.log("❌ Socket disconnected:", reason);
        setConnected(false);
        setConnectionStatus(`Disconnected: ${reason}`);
      };

      const handleConnectError = (error: Error) => {
        console.error("💥 Socket connection error:", error);
        setConnectionStatus(`Error: ${error.message}`);
      };

      // Handle new Facebook messages
      const handleNewMessage = (data: unknown) => {
        console.log("📨 Received new Facebook message:", data);
        const messageData = data as { text?: string };
        setMessages((prev) => [
          ...prev,
          `${new Date().toLocaleTimeString()}: ${
            messageData.text || JSON.stringify(data)
          }`,
        ]);
      };

      socket.on("connect", handleConnect);
      socket.on("disconnect", handleDisconnect);
      socket.on("connect_error", handleConnectError);

      // Listen for Facebook messages
      onNewFacebookMessage(handleNewMessage);

      // Cleanup on unmount
      return () => {
        socket.off("connect", handleConnect);
        socket.off("disconnect", handleDisconnect);
        socket.off("connect_error", handleConnectError);
        offNewFacebookMessage(handleNewMessage);
        socket.disconnect();
      };
    }
  }, []);

  const sendTestWebhook = async () => {
    try {
      const response = await fetch(
        "http://localhost:4000/api/v1/meta/webhook",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            object: "page",
            entry: [
              {
                id: "test_page_id_manual",
                time: Date.now(),
                messaging: [
                  {
                    sender: { id: "manual_test_sender" },
                    recipient: { id: "manual_test_recipient" },
                    timestamp: Date.now(),
                    message: {
                      mid: `manual_test_${Date.now()}`,
                      text: `Manual test message at ${new Date().toLocaleTimeString()}`,
                    },
                  },
                ],
              },
            ],
          }),
        }
      );

      if (response.ok) {
        console.log("✅ Test webhook sent successfully");
      } else {
        console.error("❌ Failed to send test webhook");
      }
    } catch (error) {
      console.error("💥 Error sending test webhook:", error);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Socket.IO Connection Test</h1>

      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Connection Status</h2>
        <p
          className={`font-mono ${
            connected ? "text-green-600" : "text-red-600"
          }`}
        >
          {connectionStatus}
        </p>
      </div>

      <div className="mb-6">
        <button
          onClick={sendTestWebhook}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Send Test Webhook Message
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Received Messages ({messages.length})
        </h2>
        <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-gray-500">No messages received yet...</p>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className="mb-2 p-2 bg-white rounded border-l-4 border-blue-500"
              >
                {message}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="text-sm text-gray-600">
        <p>• This page tests the Socket.IO connection without authentication</p>
        <p>• Click the button to send a test webhook message</p>
        <p>• Check the browser console for detailed logs</p>
      </div>
    </div>
  );
}
