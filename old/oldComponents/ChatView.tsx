"use client";
import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, AlertCircle, RefreshCw } from "lucide-react";
import { Conversation, useChatData } from "../../hooks/useChatData";

interface ChatViewProps {
  conversation: Conversation | null;
  onBack: () => void;
}

const ChatView = ({ conversation, onBack }: ChatViewProps) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { addMessage, markAsRead, sendMessage, fetchMessages, error } =
    useChatData();

  useEffect(() => {
    if (conversation && conversation.unread) {
      markAsRead(conversation.id);
    }
  }, [conversation, markAsRead]);

  useEffect(() => {
    if (conversation && conversation.messages.length === 0) {
      setLoadingMessages(true);
      fetchMessages(conversation.id).finally(() => {
        setLoadingMessages(false);
      });
    }
  }, [conversation, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [message]);

  const handleSendMessage = async () => {
    if (!message.trim() || !conversation || sending) return;

    const messageContent = message.trim();
    setMessage("");
    setSending(true);

    try {
      await sendMessage(conversation.id, messageContent);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Restore message on error
      setMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 min-h-0">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💬</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No conversation selected
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Choose a conversation from the list to start messaging with your
            customers
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white min-h-0 h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-3 sm:px-4 py-3 border-b border-gray-200 bg-white shadow-sm flex items-center">
        <button
          onClick={onBack}
          className="lg:hidden text-gray-500 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ml-2">
          <span className="text-white font-semibold text-xs sm:text-sm">
            {conversation.avatar}
          </span>
        </div>
        <div className="ml-4 flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
            {conversation.name}
          </h3>
          {conversation.location && (
            <p className="text-xs text-gray-500 truncate">
              {conversation.location}
            </p>
          )}
        </div>
        {conversation.status && (
          <span
            className={`px-2 py-1 text-xs font-medium text-white rounded-full ${conversation.statusColor}`}
          >
            {conversation.status}
          </span>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex-shrink-0 bg-red-50 border-b border-red-200 px-4 py-3">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertCircle size={16} />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 space-y-4 bg-gray-50 min-h-0">
        {loadingMessages ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2 text-gray-500">
              <RefreshCw size={16} className="animate-spin" />
              <span className="text-sm">Loading messages...</span>
            </div>
          </div>
        ) : conversation.messages.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center text-gray-500">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">💬</span>
              </div>
              <p className="text-sm">No messages yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Start the conversation below
              </p>
            </div>
          </div>
        ) : (
          conversation.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "agent" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs sm:max-w-sm ${
                  msg.sender === "agent" ? "text-right" : "text-left"
                }`}
              >
                {msg.isSystem ? (
                  <div className="text-center">
                    <span className="inline-block px-3 py-1 text-xs text-gray-500 bg-gray-100 rounded-full">
                      {msg.content}
                    </span>
                  </div>
                ) : msg.isPayment ? (
                  <div
                    className={`inline-block px-4 py-3 rounded-xl border-2 border-dashed ${
                      msg.sender === "agent"
                        ? "border-blue-300 bg-blue-50"
                        : "border-green-300 bg-green-50"
                    }`}
                  >
                    <p className="font-semibold text-sm">{msg.content}</p>
                    {msg.subtitle && (
                      <p className="text-xs text-gray-600 mt-1">
                        {msg.subtitle}
                      </p>
                    )}
                  </div>
                ) : (
                  <div
                    className={`inline-block px-3 py-2 rounded-xl shadow-sm ${
                      msg.sender === "agent"
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-white text-gray-900 rounded-bl-sm border border-gray-200"
                    }`}
                  >
                    <p className="text-sm leading-relaxed break-words">
                      {msg.content}
                    </p>
                  </div>
                )}

                {!msg.isSystem && (
                  <div
                    className={`flex items-center space-x-2 mt-1 ${
                      msg.sender === "agent" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full flex items-center justify-center bg-gray-300">
                      <span className="text-xs font-medium text-white">
                        {msg.avatar || (msg.sender === "agent" ? "A" : "C")}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{msg.time}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 px-3 sm:px-4 py-3 border-t border-gray-200 bg-white">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              rows={1}
              disabled={sending}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm leading-relaxed text-black disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ minHeight: "36px", maxHeight: "100px" }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || sending}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 transition-colors font-medium text-sm min-w-[60px] justify-center"
          >
            {sending ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <>
                <span className="hidden sm:inline">Send</span>
                <Send size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
