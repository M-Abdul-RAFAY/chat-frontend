"use client";

import { Search, MoreVertical, MessageCircle, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { ConversationsListSkeleton } from "./skeletons/ConversationSkeleton";

interface ConversationsListProps {
  platform: "facebook" | "instagram" | "whatsapp";
  selectedConversation: string | null;
  onConversationSelect: (id: string) => void;
  onMobileViewChange: (view: "platforms" | "conversations" | "inbox") => void;
  isMobile?: boolean;
  userId?: string;
}

interface FacebookConversation {
  id: string;
  message?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unread?: boolean;
  participants?: {
    data: Array<{
      id: string;
      username?: string;
      name?: string;
      profilePicture?: string;
    }>;
  };
  messages?: {
    data: Array<{
      id: string;
      message: string;
      from: {
        name?: string;
        id: string;
        username?: string;
        profilePicture?: string;
      };
      to?: {
        data: Array<{
          id: string;
          name?: string;
          username?: string;
          profilePicture?: string;
        }>;
      };
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
  ],
};

export default function ConversationsListSocial({
  platform,
  selectedConversation,
  onConversationSelect,
  onMobileViewChange,
  isMobile,
  userId,
}: ConversationsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [facebookMessages, setFacebookMessages] = useState<
    FacebookConversation[]
  >([]);
  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([]);
  const [instagramMessages, setInstagramMessages] = useState<
    FacebookConversation[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const contentType = "messages";

  // MAIN SOCKET HANDLERS FOR BOTH PLATFORMS
  useEffect(() => {
    console.log("🔌 Setting up socket handlers for BOTH platforms");

    // Instagram message handler
    const handleInstagramMessage = (data: {
      conversationId: string;
      message: any;
    }) => {
      console.log("📷 Instagram message update received:", {
        conversationId: data.conversationId,
        messageText: data.message?.text,
        messageTimestamp: data.message?.timestamp,
      });

      setInstagramMessages((prev) => {
        console.log("📷 Current Instagram conversations:", prev.length);
        const index = prev.findIndex((conv) => conv.id === data.conversationId);

        if (index >= 0) {
          console.log("📷 Found conversation at index:", index);
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            lastMessage: data.message.text || "[Attachment]",
            lastMessageTime: data.message.timestamp,
            unread: true,
          };
          const updatedConv = updated.splice(index, 1)[0];
          console.log(
            "✅ Instagram conversation updated with lastMessage:",
            updatedConv.lastMessage
          );
          return [updatedConv, ...updated];
        } else {
          console.log(
            "❌ Instagram conversation not found in list:",
            data.conversationId
          );
          console.log(
            "❌ Available conversations:",
            prev.map((c) => c.id)
          );
        }
        return prev;
      });
    };

    // Universal social message handler
    const handleSocialMessage = (data: {
      conversationId: string;
      platform: string;
      text: string;
      timestamp: string;
    }) => {
      console.log("🌐 Social message update received:", {
        platform: data.platform,
        conversationId: data.conversationId,
        text: data.text,
        timestamp: data.timestamp,
      });

      if (data.platform === "instagram") {
        setInstagramMessages((prev) => {
          console.log(
            "🌐 Updating Instagram via universal handler, conversations:",
            prev.length
          );
          const index = prev.findIndex(
            (conv) => conv.id === data.conversationId
          );
          if (index >= 0) {
            console.log("🌐 Found Instagram conversation at index:", index);
            const updated = [...prev];
            updated[index] = {
              ...updated[index],
              lastMessage: data.text || "[Attachment]",
              lastMessageTime: data.timestamp,
              unread: true,
            };
            const updatedConv = updated.splice(index, 1)[0];
            console.log(
              "✅ Instagram updated via universal handler, lastMessage:",
              updatedConv.lastMessage
            );
            return [updatedConv, ...updated];
          } else {
            console.log(
              "❌ Instagram conversation not found via universal handler:",
              data.conversationId
            );
          }
          return prev;
        });
      } else if (data.platform === "facebook") {
        setFacebookMessages((prev) => {
          console.log(
            "🌐 Updating Facebook via universal handler, conversations:",
            prev.length
          );
          const index = prev.findIndex(
            (conv) => conv.id === data.conversationId
          );
          if (index >= 0) {
            console.log("🌐 Found Facebook conversation at index:", index);
            const updated = [...prev];
            updated[index] = {
              ...updated[index],
              lastMessage: data.text || "[Attachment]",
              lastMessageTime: data.timestamp,
              unread: true,
            };
            const updatedConv = updated.splice(index, 1)[0];
            console.log(
              "✅ Facebook updated via universal handler, lastMessage:",
              updatedConv.lastMessage
            );
            return [updatedConv, ...updated];
          } else {
            console.log(
              "❌ Facebook conversation not found via universal handler:",
              data.conversationId
            );
          }
          return prev;
        });
      }
    };

    // Setup socket connections
    import("@/lib/socket").then(
      ({
        socketEventHandlers,
        connectSocket,
        getSocket,
        onNewSocialMessage,
        onRefreshInstagramChat,
        onRefreshFacebookChat,
        offNewSocialMessage,
        offRefreshInstagramChat,
        offRefreshFacebookChat,
      }) => {
        console.log("🔌 ConversationsListSocial: Starting socket setup");
        connectSocket();

        const socket = getSocket();
        if (socket) {
          console.log(
            "🔌 ConversationsListSocial: Socket connected successfully"
          );
          console.log("🔌 ConversationsListSocial: Socket ID:", socket.id);

          // Add raw event listeners to see ALL events being received
          socket.onAny((eventName: string, ...args: any[]) => {
            console.log(
              `🎯 ConversationsListSocial: Raw socket event received: ${eventName}`,
              args
            );
          });

          // Always register Instagram handlers
          console.log(
            "🔌 ConversationsListSocial: Registering Instagram message handler"
          );
          socketEventHandlers.onNewInstagramMessage(handleInstagramMessage);

          // Universal message handler for both platforms
          console.log(
            "🔌 ConversationsListSocial: Registering universal social message handler"
          );
          onNewSocialMessage((data: any) => {
            console.log(
              "🌐 ConversationsListSocial: new_social_message event received!",
              data
            );
            handleSocialMessage(data);
          });

          // Refresh handlers
          const handleRefresh = () => {
            console.log("🔄 ConversationsListSocial: Triggering refresh");
            setRefreshTrigger(Date.now());
          };

          console.log(
            "🔌 ConversationsListSocial: Registering refresh handlers"
          );
          onRefreshInstagramChat((data: any) => {
            console.log(
              "📷 ConversationsListSocial: refresh_instagram_chat event received!",
              data
            );
            handleRefresh();
          });

          onRefreshFacebookChat((data: any) => {
            console.log(
              "📘 ConversationsListSocial: refresh_facebook_chat event received!",
              data
            );
            handleRefresh();
          });

          // Store cleanup
          (socket as any)._cleanup = () => {
            offNewSocialMessage((data: any) => handleSocialMessage(data));
            offRefreshInstagramChat(handleRefresh);
            offRefreshFacebookChat(handleRefresh);
          };
        } else {
          console.error(
            "❌ ConversationsListSocial: Failed to get socket connection"
          );
        }
      }
    );

    return () => {
      console.log("🧹 Cleaning up socket handlers");
      import("@/lib/socket").then(({ socketEventHandlers, getSocket }) => {
        socketEventHandlers.offNewInstagramMessage();
        const socket = getSocket();
        if (socket && (socket as any)._cleanup) {
          (socket as any)._cleanup();
        }
      });
    };
  }, []); // No dependencies - always active

  // Fetch data when platform changes
  useEffect(() => {
    const fetchData = async () => {
      if (platform === "whatsapp") return;

      if (!userId) {
        console.log("No userId provided, skipping data fetch");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        if (platform === "facebook") {
          const response = await fetch(
            `http://localhost:4000/api/v1/meta/facebook/messages?userId=${userId}`
          );
          const data = await response.json();
          if (data.error) {
            setError(data.error);
          } else {
            setFacebookMessages(data.data || []);
          }
        } else if (platform === "instagram") {
          const response = await fetch(
            `http://localhost:4000/api/v1/meta/instagram/messages?userId=${userId}`
          );
          const data = await response.json();
          if (data.error) {
            setError(data.error);
          } else {
            setInstagramMessages(data.data || []);
            if (data.limited_access) {
              setError(data.message);
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
  }, [platform, refreshTrigger, userId]);

  // Convert real data to UI format
  const getConversations = () => {
    if (platform === "whatsapp") {
      return mockConversations.whatsapp;
    } else if (platform === "facebook") {
      return facebookMessages.map((conv) => {
        let participantName = "Unknown Contact";
        let participantAvatar =
          "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop";

        if (conv.messages?.data && conv.messages.data.length > 0) {
          const pageId = "732727859927862";
          const customerMessage = conv.messages.data.find(
            (msg) => msg.from?.id !== pageId
          );
          if (customerMessage && customerMessage.from?.name) {
            participantName = customerMessage.from.name;
            if (customerMessage.from.profilePicture) {
              participantAvatar = customerMessage.from.profilePicture;
            }
          }
        }

        const mostRecentMessage = conv.messages?.data?.[0];
        const displayLastMessage =
          conv.lastMessage || mostRecentMessage?.message || "No messages";
        const displayTimestamp =
          conv.lastMessageTime ||
          (mostRecentMessage?.created_time
            ? new Date(mostRecentMessage.created_time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "");

        // Debug logging for Facebook conversations
        console.log(`📘 Facebook conv ${conv.id}:`, {
          socketLastMessage: conv.lastMessage,
          apiLastMessage: mostRecentMessage?.message,
          displayLastMessage,
          hasMessages: conv.messages?.data?.length || 0,
        });

        return {
          id: conv.id,
          name: participantName,
          avatar: participantAvatar,
          lastMessage: displayLastMessage,
          timestamp: displayTimestamp,
          unread: conv.unread ? 1 : 0,
          online: false,
        };
      });
    } else if (platform === "instagram") {
      return instagramMessages.map((conv) => {
        const participants = conv.participants?.data || [];
        const customer = participants.find(
          (p) => p.username !== "hivemetrics12"
        );
        const customerName = customer?.username || "Instagram User";
        const customerAvatar =
          customer?.profilePicture ||
          "https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop";

        const mostRecentMessage = conv.messages?.data?.[0];
        const displayLastMessage =
          conv.lastMessage || mostRecentMessage?.message || "No messages";
        const displayTimestamp =
          conv.lastMessageTime ||
          (mostRecentMessage?.created_time
            ? new Date(mostRecentMessage.created_time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "");

        // Debug logging for Instagram conversations
        console.log(`📷 Instagram conv ${conv.id}:`, {
          socketLastMessage: conv.lastMessage,
          apiLastMessage: mostRecentMessage?.message,
          displayLastMessage,
          hasMessages: conv.messages?.data?.length || 0,
        });

        return {
          id: conv.id,
          name: customerName,
          avatar: customerAvatar,
          lastMessage: displayLastMessage,
          timestamp: displayTimestamp,
          unread: conv.unread ? 1 : 0,
          online: false,
        };
      });
    }
    return [];
  };

  const conversations = getConversations();
  const filteredConversations = conversations.filter(
    (conv) =>
      conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPlatformColors = (platform: string) => {
    switch (platform) {
      case "whatsapp":
        return {
          header: "bg-gradient-to-br from-green-600 to-green-700",
          border: "border-green-500",
          badge: "bg-green-600",
          selected:
            "bg-gradient-to-br from-green-50 to-green-100 border-l-green-500",
        };
      case "facebook":
        return {
          header: "bg-gradient-to-br from-blue-600 to-blue-700",
          border: "border-blue-500",
          badge: "bg-blue-600",
          selected:
            "bg-gradient-to-br from-blue-50 to-blue-100 border-l-blue-500",
        };
      case "instagram":
        return {
          header:
            "bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500",
          border: "border-pink-500",
          badge: "bg-gradient-to-r from-purple-500 to-pink-500",
          selected:
            "bg-gradient-to-br from-pink-50 to-purple-100 border-l-pink-500",
        };
      default:
        return {
          header: "bg-gray-500",
          border: "border-gray-500",
          badge: "bg-gray-500",
          selected: "bg-gray-50 border-l-gray-500",
        };
    }
  };

  const colors = getPlatformColors(platform);

  const totalUnread = filteredConversations.reduce(
    (sum, conv) => sum + conv.unread,
    0
  );

  return (
    <div
      className={`${
        isMobile ? "w-full" : "w-80"
      } bg-white border-r border-gray-200/50 flex flex-col h-full shadow-sm`}
    >
      {/* Header */}
      <div
        className={`p-4 border-b border-gray-200/50 ${colors.header} shadow-lg`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-xl ${
                platform === "whatsapp"
                  ? "bg-white/20"
                  : platform === "facebook"
                  ? "bg-white/20"
                  : "bg-gradient-to-br from-white/20 to-white/10"
              } flex items-center justify-center backdrop-blur-sm shadow-md`}
            >
              {platform === "whatsapp" ? (
                <MessageCircle size={20} className="text-white" />
              ) : platform === "facebook" ? (
                <MessageCircle size={20} className="text-white" />
              ) : (
                <MessageCircle size={20} className="text-white" />
              )}
            </div>
            <div>
              <h2 className="text-white font-bold text-lg capitalize tracking-wide">
                {platform}
              </h2>
              {totalUnread > 0 && (
                <p className="text-white/80 text-sm font-medium">
                  {totalUnread} unread message{totalUnread > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
          <button className="text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200 hover:scale-105">
            <MoreVertical size={20} />
          </button>
        </div>

        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60"
            size={18}
          />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/15 backdrop-blur-sm text-white placeholder-white/60 rounded-xl border border-white/10 focus:outline-none focus:bg-white/25 focus:border-white/30 transition-all duration-200 font-medium"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50/50 to-white">
        {loading ? (
          <ConversationsListSkeleton />
        ) : error ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="text-red-600 font-medium mb-2">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors"
            >
              Refresh page
            </button>
          </div>
        ) : filteredConversations.length === 0 && platform !== "whatsapp" ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={32} className="text-gray-400" />
            </div>
            <div className="text-gray-500 font-medium">
              No {platform} conversations found
            </div>
            <p className="text-gray-400 text-sm mt-1">
              Your conversations will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100/50">
            {filteredConversations.map((conversation, index) => (
              <button
                key={conversation.id}
                onClick={() => onConversationSelect(conversation.id)}
                className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50/80 transition-all duration-200 border-l-4 group hover:shadow-sm ${
                  selectedConversation === conversation.id
                    ? `${colors.selected} shadow-sm border-l-4 ${colors.border}`
                    : "border-transparent hover:border-l-gray-200"
                }`}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={conversation.avatar}
                    alt={conversation.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm group-hover:ring-gray-200 transition-all duration-200"
                  />
                  {conversation.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                  )}
                </div>

                <div className="flex-1 text-left overflow-hidden">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate group-hover:text-gray-800 transition-colors">
                      {conversation.name}
                      {conversation.isGroup && (
                        <Users
                          size={14}
                          className="inline ml-1 text-gray-400"
                        />
                      )}
                    </h3>
                    <span className="text-xs text-gray-500 flex-shrink-0 font-medium">
                      {conversation.timestamp}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate font-medium">
                      {conversation.lastMessage}
                    </p>
                    {conversation.unread > 0 && (
                      <span
                        className={`ml-2 px-2 py-1 text-xs text-white rounded-full flex-shrink-0 font-bold shadow-sm ${colors.badge} animate-pulse`}
                      >
                        {conversation.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
