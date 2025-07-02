"use client";

import { Search, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { chatAPI, Conversation } from "@/lib/api";

interface ConversationListProps {
  selectedConversation: string;
  onSelectConversation: (id: string) => void;
  collapsed: boolean;
}

export default function ConversationList({
  selectedConversation,
  onSelectConversation,
  collapsed,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch conversations from API
  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await chatAPI.getConversations();
      // Normalize _id to id
      const normalized = data.map((conv) => ({
        ...conv,
        id: conv._id || conv.id,
      }));
      setConversations(normalized);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load conversations"
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and refetch when selectedConversation changes
  useEffect(() => {
    if (mounted) {
      fetchConversations();
    }
    // Refetch when selectedConversation changes to update unread status
  }, [mounted, selectedConversation]);

  // Show loading state during SSR and initial client load
  if (!mounted) {
    return (
      <div
        className={cn(
          "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
          collapsed ? "w-0 overflow-hidden md:w-64" : "w-full md:w-64"
        )}
      >
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = (conv.name || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div
      className={cn(
        "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
        collapsed ? "w-0 overflow-hidden md:w-64" : "w-full md:w-64"
      )}
    >
      {/* Header - Fixed */}
      <div className="px-3 py-2 border-b border-gray-200 bg-white sticky top-0 z-10">
        <h2 className="text-base font-semibold text-gray-900 mb-2">
          All Conversations
        </h2>

        {/* Search */}
        <div className="relative mb-2">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={14}
          />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
          />
        </div>
      </div>

      {/* Conversation List - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">
              Loading conversations...
            </span>
          </div>
        ) : error ? (
          <div className="p-4 text-center">
            <p className="text-sm text-red-600 mb-2">{error}</p>
            <button
              onClick={fetchConversations}
              className="text-xs text-blue-600 hover:underline"
            >
              Try again
            </button>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-gray-400" />
            </div>
            <p className="text-lg font-medium mb-2">No conversations found</p>
            <p className="text-sm text-gray-400 mb-4">
              {searchQuery
                ? "Try adjusting your search terms"
                : "No conversations available"}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-blue-600 hover:underline text-sm font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          filteredConversations
            .filter(
              (conversation) =>
                conversation.id !== undefined && conversation.id !== null
            )
            .map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => {
                  onSelectConversation(conversation.id.toString());
                }}
                className={cn(
                  "px-3 py-2 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50",
                  selectedConversation === conversation.id.toString() &&
                    "bg-blue-50 border-blue-200"
                )}
              >
                <div className="flex items-start space-x-2">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center mt-3 justify-center text-xs font-medium text-white flex-shrink-0",
                      conversation.statusColor || "bg-red-500"
                    )}
                  >
                    {conversation.avatar}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="text-xs font-bold text-gray-900 truncate">
                        {conversation.name
                          .split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                      </h3>
                      <span className="text-[10px] text-gray-500 flex-shrink-0">
                        {conversation.time}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 truncate mb-1">
                      {conversation.lastMessage}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px]  bg-blue-100 text-zinc-700 font-semibold">
                        {conversation.status}
                      </span>
                      {conversation.unread && (
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
