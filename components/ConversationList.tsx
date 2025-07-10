"use client";

import { Search, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import { chatAPI, Conversation } from "@/lib/api";
import { useSocket } from "@/hooks/useSocket";

interface ConversationListProps {
  selectedConversation: string;
  onSelectConversation: (id: string) => void;
  collapsed: boolean;
}

interface SocketMessage {
  _id?: string;
  id?: string;
  content: string;
  sender: string;
  conversationId: string;
  createdAt?: string;
  timestamp?: string;
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

  // Socket integration for real-time updates
  useSocket({
    onNewConversation: (conversation: Partial<Conversation> & { _id?: string }) => {
      console.log("📞 Socket: New conversation received:", conversation);
      // Add new conversation to the top of the list
      setConversations((prev) => {
        // Check if conversation already exists
        const existingIndex = prev.findIndex(
          (conv) => conv.id === (conversation._id || conversation.id || '').toString()
        );
        
        const normalizedConv: Conversation = {
          ...conversation,
          id: (conversation._id || conversation.id || 'unknown').toString(),
          name: conversation.name || "Unknown",
          lastMessage: conversation.lastMessage || "",
          status: conversation.status || "NEW",
          time: conversation.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          avatar: conversation.avatar || conversation.name?.charAt(0).toUpperCase() || "C",
          unread: conversation.unread !== false,
          statusColor: conversation.statusColor || "bg-blue-500",
          location: conversation.location || "",
          messages: conversation.messages || [],
        };

        if (existingIndex >= 0) {
          // Update existing conversation
          const updated = [...prev];
          updated[existingIndex] = normalizedConv;
          return updated;
        } else {
          // Add new conversation at the top
          return [normalizedConv, ...prev];
        }
      });
    },
    onNewMessage: (message: SocketMessage) => {
      console.log("💬 Socket: New message received for conversation list:", message);
      // Update conversation last message and move to top if it's for a different conversation
      // than the currently selected one (since the selected one is handled by ChatInterface)
      if (message.conversationId && message.conversationId !== selectedConversation) {
        setConversations((prev) => {
          const existingIndex = prev.findIndex((conv) => conv.id === message.conversationId);
          if (existingIndex >= 0) {
            const updated = [...prev];
            const conversation = { ...updated[existingIndex] };
            
            // Update conversation data
            conversation.lastMessage = message.content;
            conversation.unread = true; // New message means unread
            conversation.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            // Move to top since it's the most recent
            updated.splice(existingIndex, 1);
            return [conversation, ...updated];
          }
          return prev;
        });
      }
    },
    onConversationUpdated: (data: { conversationId: string; lastMessage?: string; unread?: boolean; time?: string }) => {
      console.log("🔄 Socket: Conversation updated:", data);
      // Update existing conversation and move to top if it received a new message
      setConversations((prev) => {
        const existingIndex = prev.findIndex((conv) => conv.id === data.conversationId);
        if (existingIndex >= 0) {
          const updated = [...prev];
          const conversation = { ...updated[existingIndex] };
          
          // Update conversation data
          if (data.lastMessage) conversation.lastMessage = data.lastMessage;
          if (data.unread !== undefined) conversation.unread = data.unread;
          if (data.time) conversation.time = data.time;
          
          // Remove from current position and add to top if it's a new message
          updated.splice(existingIndex, 1);
          return [conversation, ...updated];
        }
        return prev;
      });
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch conversations from API with better error handling
  const fetchConversations = useCallback(async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching conversations...");
      const data = await chatAPI.getConversations();
      
      if (!data || !Array.isArray(data)) {
        throw new Error("Invalid conversations data received");
      }
      
      // Normalize _id to id for compatibility and sort by most recent
      const normalized = data
        .map((conv: Conversation & { _id?: string }) => ({
          ...conv,
          id: conv._id || conv.id,
        }))
        .sort((a, b) => {
          // Sort by time or any timestamp, most recent first
          if (a.time && b.time) {
            return new Date(b.time).getTime() - new Date(a.time).getTime();
          }
          return 0;
        });
        
      setConversations(normalized);
      console.log("Conversations loaded successfully:", normalized.length);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      
      // Auto-retry for authentication errors (up to 3 times)
      if (err instanceof Error && err.message.includes("Unauthorized") && retryCount < 3) {
        console.log(`Retrying conversation fetch (attempt ${retryCount + 1})`);
        setTimeout(() => fetchConversations(retryCount + 1), 1000 * (retryCount + 1));
        return;
      }
      
      setError(
        err instanceof Error ? err.message : "Failed to load conversations"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch only when mounted with better error handling
  useEffect(() => {
    if (!mounted) return;
    
    const initialFetch = async (retryCount = 0) => {
      try {
        setLoading(true);
        setError(null);
        console.log("Component mounted, fetching conversations...", retryCount > 0 ? `(retry ${retryCount})` : '');
        
        // Add delay for subsequent retries
        if (retryCount > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
        
        const data = await chatAPI.getConversations();
        
        if (!data || !Array.isArray(data)) {
          throw new Error("Invalid conversations data received");
        }
        
        // Normalize _id to id for compatibility and sort by most recent
        const normalized = data
          .map((conv: Conversation & { _id?: string }) => ({
            ...conv,
            id: conv._id || conv.id,
          }))
          .sort((a, b) => {
            // Sort by time or any timestamp, most recent first
            if (a.time && b.time) {
              return new Date(b.time).getTime() - new Date(a.time).getTime();
            }
            return 0;
          });
          
        setConversations(normalized);
        console.log("Conversations loaded successfully:", normalized.length);
      } catch (err) {
        console.error("Error fetching conversations:", err);
        
        // Auto-retry for authentication/network errors (up to 5 times with exponential backoff)
        if (retryCount < 5) {
          const isNetworkError = err instanceof Error && (
            err.message.includes("Unauthorized") || 
            err.message.includes("Failed to fetch") ||
            err.message.includes("is not valid JSON") ||
            err.message.includes("NetworkError") ||
            err.message.includes("Load failed")
          );
          
          if (isNetworkError) {
            console.log(`Auto-retrying conversation fetch (attempt ${retryCount + 1}/5)...`);
            setTimeout(() => initialFetch(retryCount + 1), 2000 * Math.pow(2, retryCount)); // Exponential backoff
            return;
          }
        }
        
        setError(
          err instanceof Error ? err.message : "Failed to load conversations"
        );
      } finally {
        setLoading(false);
      }
    };
    
    // Initial delay to ensure authentication is ready
    setTimeout(() => initialFetch(), 500);
  }, [mounted]);

  // Reduce periodic refresh frequency since we rely on socket events
  useEffect(() => {
    if (!mounted) return;
    
    // Refresh every 5 minutes as fallback only (was 30 seconds)
    const interval = setInterval(() => {
      console.log("Periodic refresh fallback - checking for missed updates...");
      fetchConversations();
    }, 300000); // 5 minutes
    
    return () => clearInterval(interval);
  }, [mounted, fetchConversations]);

  // Separate effect for updating unread status when conversation changes
  useEffect(() => {
    if (selectedConversation && conversations.length > 0) {
      // Mark selected conversation as read
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id.toString() === selectedConversation
            ? { ...conv, unread: false }
            : conv
        )
      );
    }
  }, [selectedConversation, conversations.length]);

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
              onClick={() => fetchConversations()}
              className="text-xs text-blue-600 hover:underline"
              disabled={loading}
            >
              {loading ? "Loading..." : "Try again"}
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Selecting conversation:", conversation.id);
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
