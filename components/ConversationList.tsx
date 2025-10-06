"use client";

import { Search, RefreshCw, MessageCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import { chatAPI, Conversation } from "@/lib/api";
import { useSocket } from "@/hooks/useSocket";

interface ConversationListProps {
  selectedConversation: string;
  onSelectConversation: (id: string, conversationData: Conversation) => void;
  collapsed: boolean;
  statusFilter?: string;
  conversationFilter?: string;
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
  statusFilter = "all",
  conversationFilter = "all",
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Socket integration for real-time updates
  useSocket({
    onNewConversation: (
      conversation: Partial<Conversation> & { _id?: string }
    ) => {
      console.log("📞 Socket: New conversation received:", conversation);
      // Add new conversation to the top of the list
      setConversations((prev) => {
        // Check if conversation already exists
        const existingIndex = prev.findIndex(
          (conv) =>
            conv.id === (conversation._id || conversation.id || "").toString()
        );

        const normalizedConv: Conversation = {
          ...conversation,
          id: (conversation._id || conversation.id || "unknown").toString(),
          name: conversation.name || "Unknown",
          lastMessage: conversation.lastMessage || "",
          status: conversation.status || "NEW",
          time:
            conversation.time ||
            new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          avatar:
            conversation.avatar ||
            conversation.name?.charAt(0).toUpperCase() ||
            "C",
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
      console.log(
        "💬 Socket: New message received for conversation list:",
        {
          conversationId: message.conversationId,
          selectedConversation,
          content: message.content?.substring(0, 30),
          sender: message.sender
        }
      );
      // Always update conversation list item when a message is received
      // This ensures the last message preview and timestamp are up-to-date
      if (message.conversationId) {
        setConversations((prev) => {
          const existingIndex = prev.findIndex(
            (conv) => conv.id.toString() === message.conversationId.toString()
          );
          if (existingIndex >= 0) {
            const updated = [...prev];
            const conversation = { ...updated[existingIndex] };

            // Update conversation data
            conversation.lastMessage = message.content;
            // Only mark as unread if it's NOT the currently selected conversation
            conversation.unread = message.conversationId.toString() !== selectedConversation.toString();
            conversation.time = new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            // Move to top since it's the most recent
            updated.splice(existingIndex, 1);
            return [conversation, ...updated];
          }
          return prev;
        });
      }
    },
    onConversationUpdated: (data: {
      conversationId: string;
      lastMessage?: string;
      unread?: boolean;
      time?: string;
    }) => {
      console.log("🔄 Socket: Conversation updated:", data);
      // Update existing conversation and move to top if it received a new message
      setConversations((prev) => {
        const existingIndex = prev.findIndex(
          (conv) => conv.id === data.conversationId
        );
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
      if (
        err instanceof Error &&
        err.message.includes("Unauthorized") &&
        retryCount < 3
      ) {
        console.log(`Retrying conversation fetch (attempt ${retryCount + 1})`);
        setTimeout(
          () => fetchConversations(retryCount + 1),
          1000 * (retryCount + 1)
        );
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
        console.log(
          "Component mounted, fetching conversations...",
          retryCount > 0 ? `(retry ${retryCount})` : ""
        );

        // Add delay for subsequent retries
        if (retryCount > 0) {
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * retryCount)
          );
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
          const isNetworkError =
            err instanceof Error &&
            (err.message.includes("Unauthorized") ||
              err.message.includes("Failed to fetch") ||
              err.message.includes("is not valid JSON") ||
              err.message.includes("NetworkError") ||
              err.message.includes("Load failed"));

          if (isNetworkError) {
            console.log(
              `Auto-retrying conversation fetch (attempt ${
                retryCount + 1
              }/5)...`
            );
            setTimeout(
              () => initialFetch(retryCount + 1),
              2000 * Math.pow(2, retryCount)
            ); // Exponential backoff
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
          "bg-gradient-to-b from-slate-50 to-white border-r border-slate-200/60 flex flex-col transition-all duration-300 shadow-sm",
          collapsed ? "w-0 overflow-hidden md:w-80" : "w-full md:w-80"
        )}
      >
        <div className="flex items-center justify-center p-12">
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
              <div className="absolute inset-0 w-8 h-8 border-2 border-slate-200 rounded-full animate-pulse"></div>
            </div>
            <p className="text-sm text-slate-500 font-medium">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = (conv.name || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "" ||
      statusFilter === "all" ||
      conv.status?.toLowerCase() === statusFilter.toLowerCase();

    // Apply conversation filter logic
    let matchesConversationFilter = true;
    if (
      conversationFilter &&
      conversationFilter !== "" &&
      conversationFilter !== "all"
    ) {
      switch (conversationFilter) {
        case "assigned":
          // Add logic for assigned conversations if you have user assignment data
          // For now, we'll assume all conversations are "assigned"
          matchesConversationFilter = true;
          break;
        case "unassigned":
          // Add logic for unassigned conversations if you have user assignment data
          // For now, we'll assume no conversations are "unassigned"
          matchesConversationFilter = false;
          break;
        default:
          matchesConversationFilter = true;
      }
    }

    return matchesSearch && matchesStatus && matchesConversationFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "NEW":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "ACTIVE":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "PENDING":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "CLOSED":
        return "bg-slate-100 text-slate-600 border-slate-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white border-r border-slate-200/60 flex flex-col transition-all duration-300 shadow-sm w-full h-full">
      {/* Header - Fixed */}
      <div className="px-6 py-5 border-b border-slate-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Conversations</h2>
            <p className="text-xs text-slate-500">
              {conversations.length} total
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Conversation List - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
                <div className="absolute inset-0 w-8 h-8 border-2 border-slate-200 rounded-full animate-pulse"></div>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-600 mb-1">
                  Loading conversations
                </p>
                <p className="text-xs text-slate-400">
                  Please wait a moment...
                </p>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={24} className="text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Connection Error
            </h3>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <button
              onClick={() => fetchConversations()}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                "Try Again"
              )}
            </button>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              {searchQuery ? (
                <Search size={28} className="text-slate-400" />
              ) : (
                <MessageCircle size={28} className="text-slate-400" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {searchQuery ? "No matches found" : "No conversations yet"}
            </h3>
            <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">
              {searchQuery
                ? "Try adjusting your search terms or check for typos"
                : "Start a new conversation to see it appear here"}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="p-2">
            {filteredConversations
              .filter(
                (conversation) =>
                  conversation.id !== undefined && conversation.id !== null
              )
              .map((conversation, index) => (
                <div
                  key={conversation.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Selecting conversation:", conversation.id);
                    onSelectConversation(
                      conversation.id.toString(),
                      conversation
                    );
                  }}
                  className={cn(
                    "group relative p-4 mx-2 mb-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
                    selectedConversation === conversation.id.toString()
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg"
                      : "bg-white hover:bg-slate-50 border border-slate-200/60 hover:border-slate-300"
                  )}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: mounted
                      ? "fadeInUp 0.3s ease-out forwards"
                      : "none",
                  }}
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg transition-transform duration-200 group-hover:scale-110",
                          conversation.statusColor
                        )}
                      >
                        {conversation.avatar}
                      </div>
                      {conversation.unread && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {conversation.name
                            .split(" ")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ")}
                        </h3>
                        <div className="flex items-center space-x-1 text-xs text-slate-500">
                          <Clock size={12} />
                          <span>{conversation.time}</span>
                        </div>
                      </div>

                      <p className="text-sm text-slate-600 truncate mb-3 leading-relaxed">
                        {conversation.lastMessage || "No messages yet"}
                      </p>

                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors",
                            getStatusColor(conversation.status)
                          )}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></div>
                          {conversation.status}
                        </span>

                        {conversation.unread && (
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium text-blue-600">
                              New
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Hover effect overlay */}
                  <div
                    className={cn(
                      "absolute inset-0 rounded-xl transition-opacity duration-200 pointer-events-none",
                      selectedConversation === conversation.id.toString()
                        ? "bg-gradient-to-r from-blue-500/5 to-indigo-500/5"
                        : "bg-slate-500/0 group-hover:bg-slate-500/5"
                    )}
                  ></div>
                </div>
              ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
