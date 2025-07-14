"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import ConversationList from "@/components/ConversationList";
import ChatInterface from "@/components/ChatInterface";
import CustomerProfile from "@/components/CustomerProfile";

export default function Inbox() {
  const [selectedConversation, setSelectedConversation] = useState("");
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
        setSidebarCollapsed(false);
        setShowConversationList(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [selectedConversation]);

  // Handle conversation selection
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    // On mobile, hide conversation list when a conversation is selected
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setShowConversationList(false);
    }
  };

  // Handle back to conversations
  const handleBackToConversations = () => {
    setShowConversationList(true);
  };

  return (
    <div className="flex flex-1 h-full min-h-0 overflow-hidden relative">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        pathname="/dashboard/inbox"
      />

      <div className="flex flex-1 h-full min-h-0 overflow-hidden">
        <ConversationList
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
          collapsed={sidebarCollapsed}
        />

        <div className="flex flex-1 h-full min-h-0 overflow-hidden relative">
          <ChatInterface
            conversationId={selectedConversation}
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
