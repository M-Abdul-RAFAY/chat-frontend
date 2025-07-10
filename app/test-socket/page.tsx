"use client";

import { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useSocket } from "@/hooks/useSocket";

export default function TestSocketPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [socketStatus, setSocketStatus] = useState<string>("Not connected");
  const [messages, setMessages] = useState<any[]>([]);

  // Get token for debugging
  useEffect(() => {
    const fetchToken = async () => {
      if (isLoaded && user) {
        try {
          const t = await getToken();
          setToken(t);
        } catch (error) {
          console.error("Error getting token:", error);
        }
      }
    };

    fetchToken();
  }, [isLoaded, user, getToken]);

  // Initialize socket
  const { isConnected, joinConversation } = useSocket({
    onNewMessage: (message) => {
      console.log("New message received:", message);
      setMessages(prev => [...prev, message]);
    },
    onNewConversation: (conversation) => {
      console.log("New conversation received:", conversation);
    },
    onConversationUpdated: (data) => {
      console.log("Conversation updated:", data);
    },
  });

  useEffect(() => {
    setSocketStatus(isConnected ? "Connected" : "Disconnected");
  }, [isConnected]);

  const testJoinConversation = () => {
    joinConversation("test-conversation-id");
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Socket Test</h1>
        <p>Please sign in to test the socket connection.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Socket Test Page</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">User Info</h2>
          <p>Email: {user.primaryEmailAddress?.emailAddress}</p>
          <p>ID: {user.id}</p>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Token Info</h2>
          <p>Token: {token ? "✓ Token available" : "✗ No token"}</p>
          <details className="mt-2">
            <summary className="cursor-pointer">Show token</summary>
            <pre className="text-xs mt-2 bg-gray-200 p-2 rounded overflow-x-auto">
              {token || "No token"}
            </pre>
          </details>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Socket Status</h2>
          <p className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            {socketStatus}
          </p>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Test Actions</h2>
          <button
            onClick={testJoinConversation}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test Join Conversation
          </button>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Real-time Messages</h2>
          {messages.length === 0 ? (
            <p>No messages received yet</p>
          ) : (
            <div className="space-y-2">
              {messages.map((msg, index) => (
                <div key={index} className="bg-white p-2 rounded text-sm">
                  <pre>{JSON.stringify(msg, null, 2)}</pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
