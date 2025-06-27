import React, { useState } from "react";
import ConversationsList from "../old/oldComponents/ConversationsList";
import ChatView from "../old/oldComponents/ChatView";
import { Conversation } from "../hooks/useChatData";

const Chat = () => {
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [conversationsOpen, setConversationsOpen] = useState(true);

  return (
    <div className="flex-1 flex overflow-hidden relative min-h-0">
      {/* Conversations List */}
      <div
        className={`
          ${
            conversationsOpen && !selectedConversation
              ? "translate-x-0"
              : "-translate-x-full"
          }
          lg:translate-x-0 lg:relative lg:flex-shrink-0
          fixed inset-y-0 left-0 z-10 w-full sm:w-80 lg:w-80 top-0
          transition-transform duration-300 ease-in-out
          lg:transition-none
        `}
      >
        <ConversationsList
          onSelectConversation={(conv) => {
            setSelectedConversation(conv);
            setConversationsOpen(false);
          }}
          selectedConversation={selectedConversation}
          onClose={() => setConversationsOpen(false)}
          activeFilter="all"
        />
      </div>

      {/* Overlay for mobile */}
      {conversationsOpen && !selectedConversation && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-0 lg:hidden"
          onClick={() => setConversationsOpen(false)}
        />
      )}

      {/* Chat View */}
      <div
        className={`
          flex-1 min-w-0 overflow-hidden
          ${selectedConversation ? "flex" : "hidden"}
          lg:flex
        `}
      >
        <ChatView
          conversation={selectedConversation}
          onBack={() => {
            setSelectedConversation(null);
            setConversationsOpen(true);
          }}
        />
      </div>
    </div>
  );
};

export default Chat;
