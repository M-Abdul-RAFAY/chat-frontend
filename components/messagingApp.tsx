"use client";

import { useState, useEffect } from "react";
import PlatformSwitcher from "./PlatformSwitcher";
import ConversationsListSocial from "./ConversationsListSocial";
import MessageInbox from "./MessageInbox";
import { initializeSocket, getSocket } from "@/lib/socket";

interface MessagingAppProps {
  userId?: string;
}

export default function MessagingApp({ userId }: MessagingAppProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<
    "facebook" | "instagram" | "whatsapp"
  >("whatsapp");
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);

  // Fixed content type to "messages" since switching is disabled
  const contentType = "messages";

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
    <div className="h-full flex bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Platform Switcher - Desktop */}
      <div className="hidden md:flex">
        <PlatformSwitcher
          selectedPlatform={selectedPlatform}
          onPlatformChange={setSelectedPlatform}
          userId={userId}
        />
      </div>

      {/* Conversations List - Desktop & Tablet */}
      <div className="hidden md:flex md:w-80">
        <ConversationsListSocial
          platform={selectedPlatform}
          selectedConversation={selectedConversation}
          onConversationSelect={setSelectedConversation}
          onMobileViewChange={setMobileView}
          userId={userId}
          // onContentTypeChange={setContentType} // Commented out since switching is disabled
        />
      </div>

      {/* Message Inbox - Desktop & Tablet */}
      <div className="hidden md:flex flex-1">
        <MessageInbox
          platform={selectedPlatform}
          conversationId={selectedConversation}
          contentType={contentType}
          onBack={() => setSelectedConversation(null)}
          userId={userId}
        />
      </div>

      {/* Mobile Layout */}
      <div className="flex flex-col w-full h-full md:hidden">
        {/* Mobile Header */}
        <div className="flex bg-white/95 backdrop-blur-sm border-b border-gray-200/50 p-4 sticky top-0 z-10 shadow-sm">
          <div className="flex space-x-2">
            <button
              onClick={() => setMobileView("platforms")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                mobileView === "platforms"
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
              }`}
            >
              Platforms
            </button>
            <button
              onClick={() => setMobileView("conversations")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                mobileView === "conversations"
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
              }`}
            >
              Chats
            </button>
            {selectedConversation && (
              <button
                onClick={() => setMobileView("inbox")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  mobileView === "inbox"
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
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
              userId={userId}
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
              userId={userId}
              // onContentTypeChange={setContentType} // Commented out since switching is disabled
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
              userId={userId}
            />
          )}
        </div>
      </div>
    </div>
  );
}
