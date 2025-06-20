"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ConversationList from "@/components/ConversationList";
import ChatInterface from "@/components/ChatInterface";
import CustomerProfile from "@/components/CustomerProfile";

export default function Inbox() {
  const [selectedConversation, setSelectedConversation] =
    useState("will-pantente");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);

  return (
    <div className="flex flex-1 h-full min-h-0 overflow-hidden">
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

        <div className="flex flex-1 h-full min-h-0 overflow-hidden">
          <ChatInterface
            conversationId={selectedConversation}
            onToggleProfile={() => setProfileVisible(!profileVisible)}
            profileVisible={profileVisible}
          />

          {profileVisible && (
            <CustomerProfile
              conversationId={selectedConversation}
              onClose={() => setProfileVisible(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
