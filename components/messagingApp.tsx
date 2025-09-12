"use client";

import { useState, useEffect } from "react";
import PlatformSwitcher from "@/components/PlatformSwitcher";
import ConversationsListSocial from "@/components/ConversationsListSocial";
import MessageInbox from "@/components/MessageInbox";
import { initializeSocket, getSocket } from "@/lib/socket";

export default function MessagingApp() {
  const [selectedPlatform, setSelectedPlatform] = useState<
    "facebook" | "instagram" | "whatsapp"
  >("whatsapp");
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [contentType, setContentType] = useState<"messages" | "posts">(
    "messages"
  );
  const [mobileView, setMobileView] = useState<
    "platforms" | "conversations" | "inbox"
  >("conversations");

  // Initialize socket connection when component mounts
  useEffect(() => {
    console.log("Initializing socket connection for messaging app...");

    // Initialize socket
    initializeSocket();

    const socket = getSocket();
    if (socket) {
      // Connect to socket
      socket.connect();

      // Set up connection event listeners
      const handleConnect = () => {
        console.log("Socket connected successfully:", socket.id);
      };

      const handleDisconnect = (reason: string) => {
        console.log("Socket disconnected:", reason);
      };

      const handleConnectError = (error: Error) => {
        console.error("Socket connection error:", error);
      };

      socket.on("connect", handleConnect);
      socket.on("disconnect", handleDisconnect);
      socket.on("connect_error", handleConnectError);

      // Cleanup on unmount
      return () => {
        socket.off("connect", handleConnect);
        socket.off("disconnect", handleDisconnect);
        socket.off("connect_error", handleConnectError);
        socket.disconnect();
      };
    }
  }, []);

  return (
    <div className="h-full flex bg-gray-50 overflow-hidden">
      {/* Platform Switcher - Desktop */}
      <div className="hidden md:flex">
        <PlatformSwitcher
          selectedPlatform={selectedPlatform}
          onPlatformChange={setSelectedPlatform}
        />
      </div>

      {/* Conversations List - Desktop & Tablet */}
      <div className="hidden md:flex md:w-80">
        <ConversationsListSocial
          platform={selectedPlatform}
          selectedConversation={selectedConversation}
          onConversationSelect={setSelectedConversation}
          onMobileViewChange={setMobileView}
          onContentTypeChange={setContentType}
        />
      </div>

      {/* Message Inbox - Desktop & Tablet */}
      <div className="hidden md:flex flex-1">
        <MessageInbox
          platform={selectedPlatform}
          conversationId={selectedConversation}
          contentType={contentType}
          onBack={() => setSelectedConversation(null)}
        />
      </div>

      {/* Mobile Layout */}
      <div className="flex flex-col w-full h-full md:hidden">
        {/* Mobile Header */}
        <div className="flex bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
          <div className="flex space-x-2">
            <button
              onClick={() => setMobileView("platforms")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                mobileView === "platforms"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Platforms
            </button>
            <button
              onClick={() => setMobileView("conversations")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                mobileView === "conversations"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Chats
            </button>
            {selectedConversation && (
              <button
                onClick={() => setMobileView("inbox")}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  mobileView === "inbox"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Messages
              </button>
            )}
          </div>
        </div>

        {/* Mobile Content */}
        <div className="flex-1 overflow-hidden min-h-0">
          {mobileView === "platforms" && (
            <PlatformSwitcher
              selectedPlatform={selectedPlatform}
              onPlatformChange={(platform) => {
                setSelectedPlatform(platform);
                setMobileView("conversations");
              }}
              isMobile={true}
            />
          )}
          {mobileView === "conversations" && (
            <ConversationsListSocial
              platform={selectedPlatform}
              selectedConversation={selectedConversation}
              onConversationSelect={(id) => {
                setSelectedConversation(id);
                setMobileView("inbox");
              }}
              onMobileViewChange={setMobileView}
              onContentTypeChange={setContentType}
              isMobile={true}
            />
          )}
          {mobileView === "inbox" && selectedConversation && (
            <MessageInbox
              platform={selectedPlatform}
              conversationId={selectedConversation}
              contentType={contentType}
              onBack={() => setMobileView("conversations")}
              isMobile={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}
