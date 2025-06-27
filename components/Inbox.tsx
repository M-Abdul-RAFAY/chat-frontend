"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ConversationList from "@/components/ConversationList";
import ChatInterface from "@/components/ChatInterface";
import CustomerProfile from "@/components/CustomerProfile";

export default function Inbox() {
  const [selectedConversation, setSelectedConversation] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);

  return (
    <div className="flex flex-1 h-full min-h-0 overflow-hidden relative">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
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
