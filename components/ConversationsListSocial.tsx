"use client";

import { Search, MoreVertical } from "lucide-react";
import { useState, useEffect } from "react";

interface ConversationsListProps {
  platform: "facebook" | "instagram" | "whatsapp";
  selectedConversation: string | null;
  onConversationSelect: (id: string) => void;
  onMobileViewChange: (view: "platforms" | "conversations" | "inbox") => void;
  onContentTypeChange?: (contentType: "messages" | "posts") => void;
  isMobile?: boolean;
}

interface FacebookConversation {
  id: string;
  messages?: {
    data: Array<{
      id: string;
      message: string;
      from: { name: string; id: string };
      created_time: string;
    }>;
  };
}

interface InstagramPost {
  id: string;
  caption: string;
  comments_count: number;
  comments: Array<{
    text: string;
    username: string;
    timestamp: string;
  }>;
}

// Mock conversations data
const mockConversations = {
  whatsapp: [
    {
      id: "1",
      name: "Sarah Wilson",
      avatar:
        "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
      lastMessage: "Hey! Are we still on for dinner tonight?",
      timestamp: "2:30 PM",
      unread: 2,
      online: true,
    },
    {
      id: "2",
      name: "Team Alpha",
      avatar:
        "https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
      lastMessage: "John: The project deadline has been moved",
      timestamp: "1:45 PM",
      unread: 0,
      online: false,
      isGroup: true,
    },
    {
      id: "3",
      name: "Mom",
      avatar:
        "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
      lastMessage: "Don't forget to call your grandmother",
      timestamp: "11:20 AM",
      unread: 0,
      online: true,
    },
    {
      id: "4",
      name: "Alex Chen",
      avatar:
        "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
      lastMessage: "Thanks for the help with the code review!",
      timestamp: "Yesterday",
      unread: 1,
      online: false,
    },
  ],
  facebook: [
    {
      id: "5",
      name: "Emma Thompson",
      avatar:
        "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
      lastMessage: "Loved your recent post about the trip!",
      timestamp: "3:15 PM",
      unread: 1,
      online: true,
    },
    {
      id: "6",
      name: "College Friends",
      avatar:
        "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
      lastMessage: "Mike: Who's coming to the reunion?",
      timestamp: "12:30 PM",
      unread: 0,
      online: false,
      isGroup: true,
    },
  ],
  instagram: [
    {
      id: "7",
      name: "travel_photographer",
      avatar:
        "https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
      lastMessage: "Amazing shots from your Iceland trip! 📸",
      timestamp: "4:20 PM",
      unread: 3,
      online: true,
    },
    {
      id: "8",
      name: "foodie_life",
      avatar:
        "https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
      lastMessage: "That pasta recipe looks incredible!",
      timestamp: "2:45 PM",
      unread: 1,
      online: false,
    },
    {
      id: "9",
      name: "jessica_designs",
      avatar:
        "https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
      lastMessage: "Can you share the color palette?",
      timestamp: "1:10 PM",
      unread: 1,
      online: true,
    },
  ],
};

export default function ConversationsListSocial({
  platform,
  selectedConversation,
  onConversationSelect,
  onMobileViewChange,
  onContentTypeChange,
  isMobile,
}: ConversationsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [facebookMessages, setFacebookMessages] = useState<
    FacebookConversation[]
  >([]);
  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([]);
  const [instagramMessages, setInstagramMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contentType, setContentType] = useState<"messages" | "posts">(
    "messages"
  );

  // Fetch data when platform or contentType changes
  useEffect(() => {
    const fetchData = async () => {
      if (platform === "whatsapp") {
        return; // WhatsApp not implemented yet
      }

      setLoading(true);
      setError(null);

      try {
        if (platform === "facebook") {
          if (contentType === "messages") {
            const response = await fetch(
              "http://localhost:4000/api/v1/meta/facebook/messages"
            );
            const data = await response.json();

            if (data.error) {
              setError(data.error);
            } else {
              setFacebookMessages(data.data || []);
            }
          } else {
            // Fetch Facebook posts/comments
            const response = await fetch(
              "http://localhost:4000/api/v1/meta/facebook/comments"
            );
            const data = await response.json();

            if (data.error) {
              setError(data.error);
            } else {
              // Convert posts to conversation format for display
              const postConversations =
                data.data?.map((post: any) => ({
                  id: post.id,
                  messages: {
                    data: post.comments?.data || [],
                  },
                })) || [];
              setFacebookMessages(postConversations);
            }
          }
        } else if (platform === "instagram") {
          if (contentType === "messages") {
            // Try to fetch Instagram messages/DMs
            const response = await fetch(
              "http://localhost:4000/api/v1/meta/instagram/messages"
            );
            const data = await response.json();

            if (data.error) {
              setError(data.error);
            } else {
              setInstagramMessages(data.data || []);
              // If limited access, show helpful message
              if (data.limited_access) {
                setError(data.message);
              }
            }
          } else {
            // Fetch Instagram posts/comments
            const response = await fetch(
              "http://localhost:4000/api/v1/meta/instagram/comments"
            );
            const data = await response.json();

            if (data.error) {
              setError(data.error);
            } else {
              setInstagramPosts(data.data || []);
            }
          }
        }
      } catch (err) {
        setError("Failed to fetch data");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [platform, contentType]);

  // Convert real data to match the existing UI structure
  const getConversations = () => {
    if (platform === "whatsapp") {
      return mockConversations.whatsapp; // Keep mock data for WhatsApp
    } else if (platform === "facebook") {
      return facebookMessages.map((conv) => ({
        id: conv.id,
        name:
          contentType === "messages"
            ? `Conversation ${conv.id.substring(0, 8)}...`
            : `Post ${conv.id.substring(0, 8)}...`,
        avatar:
          "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
        lastMessage:
          contentType === "messages"
            ? conv.messages?.data?.[0]?.message || "No messages"
            : conv.messages?.data?.[0]?.message || "No comments",
        timestamp: conv.messages?.data?.[0]?.created_time
          ? new Date(conv.messages?.data?.[0]?.created_time).toLocaleTimeString(
              [],
              { hour: "2-digit", minute: "2-digit" }
            )
          : "",
        unread: 0,
        online: false,
      }));
    } else if (platform === "instagram") {
      if (contentType === "messages") {
        // Show Instagram DMs if available
        return instagramMessages.map((dm) => ({
          id: dm.id,
          name: `DM ${dm.id.substring(0, 8)}...`,
          avatar:
            "https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
          lastMessage: dm.messages?.data?.[0]?.message || "Direct message",
          timestamp: dm.messages?.data?.[0]?.created_time
            ? new Date(dm.messages?.data?.[0]?.created_time).toLocaleTimeString(
                [],
                { hour: "2-digit", minute: "2-digit" }
              )
            : "",
          unread: 0,
          online: false,
        }));
      } else {
        // Show Instagram posts and comments
        return instagramPosts.map((post) => ({
          id: post.id,
          name: post.caption
            ? `${post.caption.substring(0, 20)}...`
            : "No caption",
          avatar:
            "https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
          lastMessage: post.comments?.[0]?.text || "No comments",
          timestamp: post.comments?.[0]?.timestamp
            ? new Date(post.comments?.[0]?.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "",
          unread: post.comments_count,
          online: false,
        }));
      }
    }
    return [];
  };

  const conversations = getConversations();
  const filteredConversations = conversations.filter(
    (conv) =>
      conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "whatsapp":
        return "bg-green-500";
      case "facebook":
        return "bg-blue-600";
      case "instagram":
        return "bg-gradient-to-br from-purple-600 via-pink-600 to-orange-400";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div
      className={`${
        isMobile ? "w-full" : "w-80"
      } bg-white border-r border-gray-200 flex flex-col h-full`}
    >
      {/* Header */}
      <div
        className={`p-4 border-b border-gray-200 ${getPlatformColor(platform)}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-lg capitalize">
            {platform}
          </h2>
          <button className="text-white hover:bg-white/20 p-2 rounded-full transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/20 text-white placeholder-white/70 rounded-full focus:outline-none focus:bg-white/30 transition-colors"
          />
        </div>

        {/* Content Type Filter Buttons - Only for Facebook and Instagram */}
        {platform !== "whatsapp" && (
          <div className="mt-3 flex space-x-2">
            <button
              onClick={() => {
                setContentType("messages");
                onContentTypeChange?.("messages");
              }}
              className={`flex-1 py-2 px-3 rounded-full text-sm font-medium transition-colors ${
                contentType === "messages"
                  ? "bg-white text-blue-600"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              💬 {platform === "facebook" ? "Messages" : "DMs"}
            </button>
            <button
              onClick={() => {
                setContentType("posts");
                onContentTypeChange?.("posts");
              }}
              className={`flex-1 py-2 px-3 rounded-full text-sm font-medium transition-colors ${
                contentType === "posts"
                  ? "bg-white text-blue-600"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              📱 {platform === "facebook" ? "Posts" : "Posts"}
            </button>
          </div>
        )}
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">
            <div className="animate-pulse">Loading {platform} data...</div>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">
            <div className="mb-2">⚠️ {error}</div>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Refresh page
            </button>
          </div>
        ) : filteredConversations.length === 0 && platform !== "whatsapp" ? (
          <div className="p-4 text-center text-gray-500">
            <div className="mb-2">{platform === "facebook" ? "📘" : "📷"}</div>
            <div>
              No {platform}{" "}
              {platform === "facebook" ? "conversations" : "posts"} found
            </div>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onConversationSelect(conversation.id)}
              className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 transition-colors border-l-4 ${
                selectedConversation === conversation.id
                  ? `bg-gray-50 border-l-4 ${
                      platform === "whatsapp"
                        ? "border-green-500"
                        : platform === "facebook"
                        ? "border-blue-600"
                        : "border-pink-500"
                    }`
                  : "border-transparent"
              }`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <img
                  src={conversation.avatar}
                  alt={conversation.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {conversation.online && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 text-left overflow-hidden">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900 truncate">
                    {conversation.name}
                    {conversation.isGroup && (
                      <span className="ml-1 text-xs text-gray-500">
                        (Group)
                      </span>
                    )}
                  </h3>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {conversation.timestamp}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 truncate">
                    {conversation.lastMessage}
                  </p>
                  {conversation.unread > 0 && (
                    <span
                      className={`ml-2 px-2 py-1 text-xs text-white rounded-full flex-shrink-0 ${
                        platform === "whatsapp"
                          ? "bg-green-500"
                          : platform === "facebook"
                          ? "bg-blue-600"
                          : "bg-pink-500"
                      }`}
                    >
                      {conversation.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
