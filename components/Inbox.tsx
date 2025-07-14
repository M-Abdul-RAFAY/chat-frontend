"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import ConversationList from "@/components/ConversationList";
import ChatInterface from "@/components/ChatInterface";
import CustomerProfile from "@/components/CustomerProfile";
import { Conversation } from "@/lib/api";

export default function Inbox() {
  const [selectedConversation, setSelectedConversation] = useState("");
  const [selectedConversationData, setSelectedConversationData] =
    useState<Conversation | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);

  // Auto-collapse sidebar on small devices and handle mobile navigation
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        // md breakpoint
        setSidebarCollapsed(true);
        // If we have a conversation selected on mobile, hide conversation list
        if (selectedConversation) {
          setShowConversationList(false);
        }
      } else {
        // On desktop, always show conversation list but don't change sidebar state
        setShowConversationList(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [selectedConversation]);

  // Handle conversation selection
  const handleSelectConversation = (
    conversationId: string,
    conversationData: Conversation
  ) => {
    setSelectedConversation(conversationId);
    setSelectedConversationData(conversationData);
    // On mobile, hide conversation list when a conversation is selected
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setShowConversationList(false);
    }
  };

  // Handle back to conversations
  const handleBackToConversations = () => {
    console.log("Back button clicked - showing conversation list");
    setShowConversationList(true);
    // Don't clear the selected conversation - just show the conversation list
  };

  return (
    <div className="flex flex-1 h-full min-h-0 overflow-hidden relative">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        pathname="/dashboard/inbox"
      />

      <div className="flex flex-1 h-full min-h-0 overflow-hidden">
        {/* Conversation List - Show/Hide based on mobile state */}
        <div
          className={`
          ${
            showConversationList ? "flex w-full" : "hidden"
          } md:flex md:w-64 lg:w-64
          h-full min-h-0 overflow-hidden
        `}
        >
          <ConversationList
            selectedConversation={selectedConversation}
            onSelectConversation={handleSelectConversation}
            collapsed={sidebarCollapsed}
          />
        </div>

        {/* Chat Interface - Show based on state */}
        <div
          className={`
          ${!showConversationList ? "flex w-full" : "hidden"} md:flex md:flex-1
          h-full min-h-0 overflow-hidden relative
        `}
        >
          <ChatInterface
            conversationId={selectedConversation}
            conversationData={selectedConversationData}
            onToggleProfile={() => setProfileVisible(!profileVisible)}
            profileVisible={profileVisible}
            onBackToConversations={handleBackToConversations}
          />

          {/* Profile Overlay - WhatsApp Style */}
          {profileVisible && (
            <>
              {/* Mobile backdrop */}
              <div
                className="absolute inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                onClick={() => setProfileVisible(false)}
              />

              {/* Profile Panel */}
              <div className="absolute inset-y-0 right-0 w-full md:w-80 lg:w-80 z-40 transform transition-transform duration-300 ease-in-out">
                <CustomerProfile
                  conversationId={selectedConversation}
                  conversationData={selectedConversationData}
                  onClose={() => setProfileVisible(false)}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
