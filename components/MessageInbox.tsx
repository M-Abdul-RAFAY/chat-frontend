"use client";

import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
  Send,
  Mic,
  X,
  Image as ImageIcon,
  File,
  Clock,
  CheckCheck,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { socketEventHandlers, getSocket, initializeSocket } from "@/lib/socket";
import { MessagesListSkeleton } from "./skeletons/MessageSkeleton";

interface MessageInboxProps {
  platform: "facebook" | "instagram" | "whatsapp";
  conversationId: string | null;
  contentType?: "messages" | "posts";
  onBack: () => void;
  isMobile?: boolean;
  userId?: string;
}

interface FacebookMessage {
  id: string;
  message: string;
  from: {
    name: string;
    id: string;
    profilePicture?: string;
  };
  created_time: string;
}

interface InstagramComment {
  text: string;
  username: string;
  timestamp: string;
}

// Mock messages data
const mockMessages: Record<string, any[]> = {
  "1": [
    {
      id: 1,
      text: "Hey! How's your day going?",
      sender: "other",
      timestamp: "2:25 PM",
      avatar:
        "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop",
    },
    {
      id: 2,
      text: "Pretty good! Just finished a big project at work. How about you?",
      sender: "me",
      timestamp: "2:27 PM",
      status: "read",
    },
    {
      id: 3,
      text: "That's awesome! I've been planning this dinner for weeks 😄",
      sender: "other",
      timestamp: "2:28 PM",
      avatar:
        "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop",
    },
    {
      id: 4,
      text: "Are we still on for dinner tonight?",
      sender: "other",
      timestamp: "2:30 PM",
      avatar:
        "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop",
    },
  ],
  "7": [
    {
      id: 1,
      text: "Your Iceland photos are incredible! 📸",
      sender: "other",
      timestamp: "4:15 PM",
      avatar:
        "https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop",
    },
    {
      id: 2,
      text: "Thank you! It was an amazing trip. The Northern Lights were spectacular.",
      sender: "me",
      timestamp: "4:17 PM",
      status: "read",
    },
    {
      id: 3,
      text: "I'm so jealous! How long were you there?",
      sender: "other",
      timestamp: "4:18 PM",
      avatar:
        "https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop",
    },
    {
      id: 4,
      text: "Amazing shots from your Iceland trip! 📸",
      sender: "other",
      timestamp: "4:20 PM",
      avatar:
        "https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop",
    },
  ],
};

const conversationDetails: Record<string, any> = {
  "1": {
    name: "Sarah Wilson",
    avatar:
      "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop",
    status: "Online",
  },
  "7": {
    name: "travel_photographer",
    avatar:
      "https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop",
    status: "Active 5 min ago",
  },
};

export default function MessageInbox({
  platform,
  conversationId,
  contentType = "messages",
  onBack,
  isMobile,
  userId,
}: MessageInboxProps) {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationParticipant, setConversationParticipant] = useState<{
    name: string;
    avatar: string;
    status: string;
  } | null>(null);
  const [conversationData, setConversationData] = useState<{
    phone?: string;
    customerName?: string;
    id?: string;
  } | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId, platform, contentType]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for real-time Facebook messages
  useEffect(() => {
    const socket = getSocket();
    if (!socket || platform !== "facebook") return;

    const handleNewFacebookMessage = (data: {
      conversationId: string;
      message: any;
      platform: string;
    }) => {
      console.log("🔔 Received real-time Facebook message:", data);

      // Check if this message is for the current conversation
      if (data.conversationId === conversationId) {
        console.log(
          "✅ Message is for current conversation, adding to messages"
        );
        setMessages((prev) => [...prev, data.message]);
      } else {
        console.log(
          "ℹ️ Message is for different conversation:",
          data.conversationId,
          "vs",
          conversationId
        );
      }
    };

    console.log("🔧 MessageInbox: Setting up Facebook Socket.IO listeners");
    console.log("📋 MessageInbox: Current conversation ID:", conversationId);

    // Simple and reliable Facebook webhook message handler
    const handleFacebookWebhookMessage = (data: any) => {
      console.log("🚀 MessageInbox: Facebook webhook message received:", data);
      console.log("📋 MessageInbox: Current conversation ID:", conversationId);
      console.log(
        "📋 MessageInbox: Message conversation ID:",
        data.conversationId
      );
      console.log("📋 MessageInbox: Message sender ID:", data.sender);

      // Check if message is for current conversation
      const isForCurrentConversation =
        conversationId &&
        (data.conversationId === conversationId ||
          data.sender === conversationId);

      console.log(
        "🎯 MessageInbox: Is for current conversation?",
        isForCurrentConversation
      );

      if (isForCurrentConversation) {
        console.log(
          "✅ MessageInbox: Adding Facebook message immediately to current conversation"
        );

        const newMessage = {
          id: data.messageId || data.message?.id || Date.now().toString(),
          text: data.text || data.message?.text || "[Message]",
          sender: "other", // From customer
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          avatar: `https://via.placeholder.com/40x40/1877F2/ffffff?text=F`,
          created_time: data.timestamp || new Date().toISOString(),
          from: {
            id: data.sender || data.conversationId,
            name: "Facebook User",
          },
        };

        console.log(
          "📝 MessageInbox: Adding new Facebook message to state:",
          newMessage
        );
        setMessages((prev) => {
          console.log("📝 MessageInbox: Previous messages count:", prev.length);
          const updated = [...prev, newMessage];
          console.log(
            "📝 MessageInbox: Updated messages count:",
            updated.length
          );
          return updated;
        });

        // Scroll to bottom to show new message
        setTimeout(() => {
          console.log("📜 MessageInbox: Scrolling to bottom");
          scrollToBottom();
        }, 100);
      }

      // Always also refresh to ensure full sync
      console.log("🔄 MessageInbox: Also triggering full refresh for Facebook");
      if (conversationId) {
        fetchMessages();
      }
    };

    // Set up both old and new Facebook event listeners
    socketEventHandlers.onNewFacebookMessage(handleNewFacebookMessage);

    // Set up direct socket event listeners for webhook events
    console.log("🔧 MessageInbox: Setting up Facebook webhook event listeners");
    socket.on("new_social_message", handleFacebookWebhookMessage);
    socket.on("new_facebook_message", handleFacebookWebhookMessage);

    // Listen for Facebook refresh events
    socket.on("refresh_facebook_chat", (data: any) => {
      console.log("🔄 MessageInbox: Facebook refresh event received:", data);
      if (conversationId) {
        console.log(
          "🔄 MessageInbox: Refreshing messages due to Facebook refresh event"
        );
        fetchMessages();
      }
    });

    // Cleanup
    return () => {
      console.log("🧹 MessageInbox: Cleaning up Facebook socket listeners");
      socketEventHandlers.offNewFacebookMessage();

      // Clean up direct socket listeners
      socket.off("new_social_message", handleFacebookWebhookMessage);
      socket.off("new_facebook_message", handleFacebookWebhookMessage);
      socket.off("refresh_facebook_chat");
    };
  }, [conversationId, platform]);

  // Listen for real-time Instagram messages
  useEffect(() => {
    const socket = getSocket();
    if (!socket || platform !== "instagram") return;

    const handleNewInstagramMessage = (data: {
      conversationId: string;
      socialConversationId?: string;
      message: any;
      platform: string;
    }) => {
      console.log("🔔 Received real-time Instagram message:", data);

      // Check if this message is for the current conversation
      if (
        data.conversationId === conversationId ||
        data.socialConversationId === conversationId
      ) {
        console.log(
          "✅ Instagram message is for current conversation, adding to messages"
        );
        setMessages((prev) => [...prev, data.message]);
      } else {
        console.log(
          "ℹ️ Instagram message is for different conversation:",
          data.conversationId,
          "vs",
          conversationId
        );
      }
    };

    // Handle new social media messages (universal event)
    const handleNewSocialMessage = (data: {
      conversationId: string;
      messageId: string;
      platform: string;
      sender: string;
      text: string;
      timestamp: string;
    }) => {
      console.log("📱 Received new social media message:", data);

      if (
        data.platform === "instagram" &&
        data.conversationId === conversationId
      ) {
        // Refetch messages to get the latest data
        console.log("🔄 Refreshing messages due to new social message");
        // You could trigger a refetch here or add the message directly
        const newMessage = {
          id: data.messageId,
          text: data.text,
          sender: "other",
          timestamp: new Date(data.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          created_time: data.timestamp,
          from: {
            id: data.sender,
            name: "Instagram User",
          },
        };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    // Handle messages sync completion
    const handleMessagesSynced = (data: {
      conversationId: string;
      platform: string;
      count: number;
      timestamp: string;
    }) => {
      console.log("🔄 Messages synced:", data);

      if (
        data.platform === "instagram" &&
        data.conversationId === conversationId
      ) {
        console.log("📱 Refreshing Instagram messages after sync");
        // Optionally refetch messages after sync
        // fetchMessages(); // You could implement this
      }
    };

    // Set up event listeners with improved sync handling
    socketEventHandlers.onNewInstagramMessage(handleNewInstagramMessage);

    console.log(
      "🔧 MessageInbox: Setting up Socket.IO listeners for platform:",
      platform
    );
    console.log("📋 MessageInbox: Current conversation ID:", conversationId);

    // Simple and reliable social message handler
    const handleWebhookMessage = (data: any) => {
      console.log("� MessageInbox: Webhook message received:", data);
      console.log("📋 MessageInbox: Current conversation ID:", conversationId);
      console.log(
        "📋 MessageInbox: Message conversation ID:",
        data.conversationId
      );
      console.log("📋 MessageInbox: Message sender ID:", data.sender);

      // Check if message is for current conversation
      const isForCurrentConversation =
        conversationId &&
        (data.conversationId === conversationId ||
          data.sender === conversationId);

      console.log(
        "🎯 MessageInbox: Is for current conversation?",
        isForCurrentConversation
      );

      if (isForCurrentConversation) {
        console.log(
          "✅ MessageInbox: Adding message immediately to current conversation"
        );

        const newMessage = {
          id: data.messageId || data.message?.id || Date.now().toString(),
          text: data.text || data.message?.text || "[Message]",
          sender: "other", // From customer
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          avatar: `https://via.placeholder.com/40x40/1877F2/ffffff?text=${(
            data.platform || "F"
          )
            .charAt(0)
            .toUpperCase()}`,
          created_time: data.timestamp || new Date().toISOString(),
          from: {
            id: data.sender || data.conversationId,
            name: `${data.platform || "Facebook"} User`,
          },
        };

        console.log(
          "📝 MessageInbox: Adding new message to state:",
          newMessage
        );
        setMessages((prev) => {
          console.log("📝 MessageInbox: Previous messages count:", prev.length);
          const updated = [...prev, newMessage];
          console.log(
            "📝 MessageInbox: Updated messages count:",
            updated.length
          );
          return updated;
        });

        // Scroll to bottom to show new message
        setTimeout(() => {
          console.log("📜 MessageInbox: Scrolling to bottom");
          scrollToBottom();
        }, 100);
      }

      // Always also refresh to ensure full sync
      console.log("🔄 MessageInbox: Also triggering full refresh");
      if (conversationId && platform !== "whatsapp") {
        fetchMessages();
      }
    };

    // Set up direct socket event listeners
    console.log("🔧 MessageInbox: Setting up direct socket event listeners");
    socket.on("new_social_message", handleWebhookMessage);

    if (platform === "facebook") {
      console.log("� MessageInbox: Adding Facebook-specific listeners");
      socket.on("new_facebook_message", handleWebhookMessage);
      socket.on("refresh_facebook_chat", (data: any) => {
        console.log("🔄 MessageInbox: Facebook refresh event received:", data);
        if (conversationId) {
          console.log(
            "🔄 MessageInbox: Refreshing messages due to Facebook refresh event"
          );
          fetchMessages();
        }
      });
    } else if (platform === "instagram") {
      console.log("🔧 MessageInbox: Adding Instagram-specific listeners");
      socket.on("new_instagram_message", handleWebhookMessage);
      socket.on("refresh_instagram_chat", (data: any) => {
        console.log("🔄 MessageInbox: Instagram refresh event received:", data);
        if (conversationId) {
          console.log(
            "🔄 MessageInbox: Refreshing messages due to Instagram refresh event"
          );
          fetchMessages();
        }
      });
    }

    // Add listeners for legacy events
    socket.on("new_social_message", handleNewSocialMessage);
    socket.on("messages_synced", handleMessagesSynced);

    // Listen for refresh events from webhooks
    const handleChatRefresh = (data: {
      platform: string;
      timestamp: string;
      reason: string;
    }) => {
      console.log(
        `🔄 ${
          platform.charAt(0).toUpperCase() + platform.slice(1)
        } chat refresh event received:`,
        data
      );
      // Refresh the current conversation messages directly
      if (conversationId && platform !== "whatsapp") {
        console.log("🔄 Refreshing messages due to webhook event");
        fetchMessages();
      }
    };

    // Listen for platform-specific refresh events
    if (platform === "facebook") {
      socket.on("refresh_facebook_chat", handleChatRefresh);
    } else if (platform === "instagram") {
      socket.on("refresh_instagram_chat", handleChatRefresh);
    }

    // Also listen for general new message events to trigger refresh
    const handleNewMessage = (data: any) => {
      console.log("🔔 New message event received:", data);
      if (
        data.conversationId === conversationId ||
        data.sender === conversationId
      ) {
        console.log("✅ Message is for current conversation, refreshing...");
        fetchMessages();
      }
    };

    socket.on("new_facebook_message", handleNewMessage);
    socket.on("new_instagram_message", handleNewMessage);

    // Cleanup
    return () => {
      console.log("🧹 MessageInbox: Cleaning up Instagram socket listeners");
      socketEventHandlers.offNewInstagramMessage();

      // Clean up Instagram webhook listeners (still using the general handleWebhookMessage)
      socket.off("new_social_message", handleWebhookMessage);
      socket.off("new_instagram_message", handleWebhookMessage);
      socket.off("refresh_instagram_chat");

      // Clean up legacy event handlers
      socket.off("new_social_message", handleNewSocialMessage);
      socket.off("messages_synced", handleMessagesSynced);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, platform]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;

    setLoading(true);
    setError(null);

    try {
      // First get the connection status to know the page ID
      const statusResponse = await fetch(
        `http://localhost:4000/api/v1/meta/status?userId=${userId}`
      );
      const statusData = await statusResponse.json();
      const pageId = statusData.page_id;

      if (platform === "facebook") {
        // Choose endpoint based on contentType
        const endpoint =
          contentType === "messages"
            ? `http://localhost:4000/api/v1/meta/facebook/messages?userId=${userId}`
            : `http://localhost:4000/api/v1/meta/facebook/comments?userId=${userId}`;

        const response = await fetch(endpoint);
        const data = await response.json();

        if (data.error) {
          setError(data.error);
        } else {
          if (contentType === "messages") {
            // Handle Facebook messages
            const conversation = data.data?.find(
              (conv: any) => conv.id === conversationId
            );
            if (conversation?.messages?.data) {
              // Extract participant info from the first customer message
              const customerMessage = conversation.messages.data.find(
                (msg: FacebookMessage) => msg.from.id !== pageId
              );

              if (customerMessage) {
                setConversationParticipant({
                  name: customerMessage.from.name,
                  avatar:
                    customerMessage.from.profilePicture ||
                    "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop",
                  status: "Active on Facebook",
                });
              }

              const formattedMessages = conversation.messages.data
                .map((msg: FacebookMessage, index: number) => {
                  // Extract profile picture and name for the sender
                  let senderAvatar =
                    "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop";
                  let senderName = "Unknown";

                  if (msg.from?.profilePicture) {
                    senderAvatar = msg.from.profilePicture;
                  }
                  if (msg.from?.name) {
                    senderName = msg.from.name;
                  }

                  return {
                    id: index,
                    text: msg.message,
                    // Determine sender: if from.id equals pageId, it's from business (me), otherwise customer (other)
                    sender: msg.from.id === pageId ? "me" : "other",
                    timestamp: new Date(msg.created_time).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    ),
                    avatar: senderAvatar,
                    senderName: senderName,
                  };
                })
                // Reverse the order to show oldest messages first (chronological order)
                .reverse();
              setMessages(formattedMessages);
            }
          } else {
            // Handle Facebook posts/comments
            const post = data.data?.find((p: any) => p.id === conversationId);
            if (post?.comments?.data) {
              const formattedMessages = post.comments.data
                .map((comment: any, index: number) => ({
                  id: index,
                  text: comment.message,
                  // For comments, check if comment author is the page
                  sender: comment.from?.id === pageId ? "me" : "other",
                  timestamp: new Date(comment.created_time).toLocaleTimeString(
                    [],
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  ),
                  avatar:
                    "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop",
                }))
                // Reverse the order to show oldest comments first
                .reverse();
              setMessages(formattedMessages);
            }
          }
        }
      } else if (platform === "instagram") {
        // Fetch Instagram DMs directly from API
        console.log("📱 Fetching Instagram messages from API");
        const apiResponse = await fetch(
          `http://localhost:4000/api/v1/meta/instagram/messages?userId=${userId}`
        );
        const apiData = await apiResponse.json();

        if (apiData.error) {
          setError(apiData.error);
        } else {
          // Find the specific conversation
          const conversation = apiData.data?.find(
            (conv: any) => conv.id === conversationId
          );
          if (conversation?.messages?.data) {
            // Extract participant info - find the customer (non-business) participant
            const participants = conversation.participants?.data || [];
            const customer = participants.find(
              (p: any) => p.username !== "hivemetrics12" // Your business username
            );

            if (customer) {
              console.log("📸 Customer profile data:", customer);
              const avatarUrl =
                customer.profilePicture ||
                `https://via.placeholder.com/50x50/E1306C/ffffff?text=${(
                  customer.username || "IG"
                )
                  .charAt(0)
                  .toUpperCase()}`;

              setConversationParticipant({
                name: customer.username || "Instagram User",
                avatar: avatarUrl,
                status: "Active on Instagram",
              });

              console.log("✅ Set conversation participant:", {
                name: customer.username || "Instagram User",
                avatar: avatarUrl,
              });
            }

            const formattedMessages = conversation.messages.data
              .map((msg: any, index: number) => {
                // Extract profile picture and username for the sender
                let senderAvatar = `https://via.placeholder.com/40x40/E1306C/ffffff?text=IG`;
                let senderName = "Unknown";

                if (msg.from?.profilePicture) {
                  senderAvatar = msg.from.profilePicture;
                } else if (msg.from?.username) {
                  // Create a custom avatar with first letter of username
                  senderAvatar = `https://via.placeholder.com/40x40/E1306C/ffffff?text=${msg.from.username
                    .charAt(0)
                    .toUpperCase()}`;
                }

                if (msg.from?.username) {
                  senderName = msg.from.username;
                } else if (msg.from?.name) {
                  senderName = msg.from.name;
                }

                console.log(
                  "💬 Message avatar for",
                  senderName,
                  ":",
                  senderAvatar
                );

                return {
                  id: index,
                  text: msg.message,
                  // Determine sender: if from.username equals business username, it's from business (me), otherwise customer (other)
                  sender:
                    msg.from.username === "hivemetrics12" ? "me" : "other",
                  timestamp: new Date(msg.created_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  avatar: senderAvatar,
                  senderName: senderName,
                };
              })
              .reverse(); // Show newest messages at the bottom

            setMessages(formattedMessages);
          }
        }
      } else if (platform === "whatsapp") {
        // Fetch WhatsApp messages from the backend
        console.log("📱 Fetching WhatsApp messages from API");
        const apiResponse = await fetch(
          `http://localhost:4000/api/chat/messages?conversationId=${conversationId}`
        );
        const apiData = await apiResponse.json();

        if (apiData.success && apiData.messages) {
          // Set conversation participant based on the first customer message
          const conversation = await fetch(
            `http://localhost:4000/api/v1/conversations/${conversationId}`
          );
          const conversationData = await conversation.json();

          if (conversationData.success && conversationData.conversation) {
            const conv = conversationData.conversation;

            // Store conversation data including phone
            setConversationData({
              phone: conv.phone,
              customerName: conv.customerName,
              id: conv._id || conv.id,
            });

            // Also set the participant for UI display
            setConversationParticipant({
              name: conv.customerName || conv.phone || "WhatsApp User",
              avatar: `https://via.placeholder.com/40x40/25D366/ffffff?text=${(
                conv.customerName || "WA"
              )
                .charAt(0)
                .toUpperCase()}`,
              status: "WhatsApp",
            });
          }

          // Format messages for display
          const formattedMessages = apiData.messages.map(
            (msg: any, index: number) => ({
              id: index,
              text: msg.content || msg.message || "",
              sender:
                msg.isFromBusiness ||
                msg.sender === "business" ||
                msg.sender === "AI"
                  ? "me"
                  : "other",
              timestamp: new Date(
                msg.timestamp || msg.createdAt
              ).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              avatar:
                msg.isFromBusiness ||
                msg.sender === "business" ||
                msg.sender === "AI"
                  ? `https://via.placeholder.com/40x40/25D366/ffffff?text=B`
                  : `https://via.placeholder.com/40x40/25D366/ffffff?text=C`,
              senderName:
                msg.isFromBusiness ||
                msg.sender === "business" ||
                msg.sender === "AI"
                  ? "Business"
                  : "Customer",
            })
          );

          setMessages(formattedMessages);
        }
      }
    } catch (err) {
      setError("Failed to fetch messages");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [conversationId, platform, contentType, userId]);

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 min-h-full">
        <div className="text-center p-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-4xl">💬</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            Select a conversation
          </h3>
          <p className="text-gray-600 max-w-sm">
            Choose a conversation from the list to start messaging and engaging
            with your customers
          </p>
        </div>
      </div>
    );
  }

  // Use real data for all platforms including WhatsApp
  const displayMessages = messages;
  const conversation = conversationParticipant || {
    name: platform === "whatsapp" ? "WhatsApp User" : "User",
    avatar:
      platform === "whatsapp"
        ? `https://via.placeholder.com/40x40/25D366/ffffff?text=W`
        : `https://via.placeholder.com/40x40/4267B2/ffffff?text=U`,
    status: platform === "whatsapp" ? "WhatsApp" : "Active",
  };

  const getPlatformColors = (platform: string) => {
    switch (platform) {
      case "whatsapp":
        return {
          header: "bg-gradient-to-br from-green-600 to-green-700",
          message: "bg-gradient-to-br from-green-600 to-green-700",
          button:
            "bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800",
        };
      case "facebook":
        return {
          header: "bg-gradient-to-br from-blue-600 to-blue-700",
          message: "bg-gradient-to-br from-blue-600 to-blue-700",
          button:
            "bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
        };
      case "instagram":
        return {
          header:
            "bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500",
          message: "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500",
          button:
            "bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 hover:from-purple-700 hover:via-pink-700 hover:to-red-600",
        };
      default:
        return {
          header: "bg-gray-500",
          message: "bg-gray-500",
          button: "bg-gray-500 hover:bg-gray-600",
        };
    }
  };

  const colors = getPlatformColors(platform);

  // Emoji picker functionality
  const emojis = [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "🙃",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "😋",
    "😛",
    "😝",
    "😜",
    "🤪",
    "🤨",
    "🧐",
    "🤓",
    "😎",
    "🤩",
    "🥳",
    "😏",
    "😒",
    "😞",
    "😔",
    "😟",
    "😕",
    "🙁",
    "☹️",
    "😣",
    "😖",
    "😫",
    "😩",
    "🥺",
    "😢",
    "😭",
    "😤",
    "😠",
    "😡",
    "🤬",
    "🤯",
    "😳",
    "🥵",
    "🥶",
    "😱",
    "😨",
    "😰",
    "😥",
    "😓",
    "🤗",
    "🤔",
    "🤭",
    "🤫",
    "🤥",
    "😶",
    "😐",
    "😑",
    "😬",
    "🙄",
    "😯",
    "😦",
    "😧",
    "😮",
    "😲",
    "🥱",
    "😴",
    "🤤",
    "😪",
    "😵",
    "🤐",
    "🥴",
    "🤢",
    "🤮",
    "🤧",
    "😷",
    "🤒",
    "🤕",
    "🤑",
    "🤠",
    "😈",
    "👍",
    "👎",
    "👌",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👈",
    "👉",
    "👆",
    "👇",
    "☝️",
    "✋",
    "🤚",
    "🖐️",
    "🖖",
    "👋",
    "🤏",
    "💪",
    "🦾",
    "🦿",
    "🦵",
    "🦶",
    "👂",
    "🦻",
    "👃",
    "🧠",
    "🫀",
    "🫁",
    "🦷",
    "🦴",
    "👀",
    "👁️",
    "👅",
    "👄",
    "💋",
    "🩸",
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "🤎",
    "💔",
    "❣️",
    "💕",
  ];

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setAttachedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && attachedFiles.length === 0) || !conversationId)
      return;

    setSendingMessage(true);

    try {
      // Add the message to local state immediately for better UX
      const tempMessage = {
        id: Date.now(),
        text: newMessage,
        sender: "me",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        avatar: "", // No avatar for sent messages
        attachments: attachedFiles.map((file) => ({
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file), // Create preview URL
        })),
        status: "sending",
      };

      setMessages((prev) => [...prev, tempMessage]);
      const messageToSend = newMessage;
      const filesToSend = [...attachedFiles];
      setNewMessage("");
      setAttachedFiles([]);

      // Send to backend
      if (platform === "facebook") {
        const endpoint =
          contentType === "messages"
            ? `http://localhost:4000/api/v1/meta/facebook/send-message?userId=${userId}`
            : `http://localhost:4000/api/v1/meta/facebook/send-comment?userId=${userId}`;

        // If there are files, we need to handle file upload differently
        if (filesToSend.length > 0) {
          console.log(
            "Sending files:",
            filesToSend.map((f) => ({
              name: f.name,
              type: f.type,
              size: f.size,
            }))
          );
          console.log("Sending to conversationId:", conversationId);
          console.log("Message text:", messageToSend);

          const formData = new FormData();
          formData.append("conversationId", conversationId);
          formData.append("message", messageToSend);
          filesToSend.forEach((file) => {
            formData.append(`files`, file);
          });

          console.log("FormData entries:");
          for (const [key, value] of formData.entries()) {
            console.log(key, value);
          }

          const response = await fetch(endpoint, {
            method: "POST",
            body: formData,
          });

          const responseData = await response.json();
          console.log("Backend response:", responseData);

          if (!response.ok) {
            throw new Error(
              responseData.error || "Failed to send message with attachments"
            );
          }
        } else {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              conversationId,
              message: messageToSend,
            }),
          });

          const responseData = await response.json();

          if (!response.ok) {
            throw new Error(responseData.error || "Failed to send message");
          }
        }
      } else if (platform === "instagram") {
        const endpoint =
          contentType === "messages"
            ? `http://localhost:4000/api/v1/meta/instagram/send-message?userId=${userId}`
            : `http://localhost:4000/api/v1/meta/instagram/send-comment?userId=${userId}`;

        // Handle file uploads for Instagram (similar to Facebook)
        if (filesToSend.length > 0) {
          console.log(
            "Sending Instagram files:",
            filesToSend.map((f) => ({
              name: f.name,
              type: f.type,
              size: f.size,
            }))
          );
          console.log("Sending to Instagram conversationId:", conversationId);
          console.log("Instagram message text:", messageToSend);

          const formData = new FormData();
          formData.append("conversationId", conversationId);
          formData.append("message", messageToSend);
          filesToSend.forEach((file) => {
            formData.append(`files`, file);
          });

          console.log("Instagram FormData entries:");
          for (const [key, value] of formData.entries()) {
            console.log(key, value);
          }

          const response = await fetch(endpoint, {
            method: "POST",
            body: formData,
          });

          const responseData = await response.json();
          console.log("Instagram backend response:", responseData);

          if (!response.ok) {
            throw new Error(
              responseData.error ||
                "Failed to send Instagram message with attachments"
            );
          }
        } else {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              conversationId,
              message: messageToSend,
            }),
          });

          const responseData = await response.json();

          if (!response.ok) {
            throw new Error(
              responseData.error || "Failed to send Instagram message"
            );
          }
        }
      } else if (platform === "whatsapp") {
        // Handle WhatsApp message sending
        const response = await fetch(
          `http://localhost:4000/api/chat/whatsapp/send`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              phone: conversationData?.phone || "unknown", // Use conversationData instead of conversation
              message: messageToSend,
              conversationId,
            }),
          }
        );

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(
            responseData.error || "Failed to send WhatsApp message"
          );
        }
      }

      // Update message status to sent
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessage.id ? { ...msg, status: "sent" } : msg
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove the temporary message if sending failed
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
      // Show specific error message to user
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to send message. Please try again.";
      alert(errorMessage);
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white shadow-sm">
      {/* Header */}
      <div
        className={`p-4 border-b border-gray-200/50 ${colors.header} shadow-lg`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isMobile && (
              <button
                onClick={onBack}
                className="text-white/90 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div className="relative">
              <img
                src={conversation?.avatar}
                alt={conversation?.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-white/30 shadow-md"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">
                {conversation?.name}
              </h3>
              <p className="text-sm text-white/80 font-medium flex items-center">
                {isTyping ? (
                  <>
                    <span className="inline-flex space-x-1 mr-2">
                      <div
                        className="w-1 h-1 bg-white/60 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-1 h-1 bg-white/60 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-1 h-1 bg-white/60 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </span>
                    typing...
                  </>
                ) : (
                  conversation?.status
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="text-white/90 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200 hover:scale-105">
              <Phone size={18} />
            </button>
            <button className="text-white/90 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200 hover:scale-105">
              <Video size={18} />
            </button>
            <button className="text-white/90 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200 hover:scale-105">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50/30 to-white">
        {loading ? (
          <MessagesListSkeleton />
        ) : (
          <>
            {displayMessages.map((message, index) => (
              <div
                key={message.id}
                className={`flex animate-fade-in ${
                  message.sender === "me" ? "justify-end" : "justify-start"
                }`}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <div
                  className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                    message.sender === "me"
                      ? "flex-row-reverse space-x-reverse"
                      : ""
                  }`}
                >
                  {message.sender === "other" && (
                    <img
                      src={message.avatar}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-2 ring-white shadow-sm"
                    />
                  )}

                  <div
                    className={`px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
                      message.sender === "me"
                        ? `text-white ${colors.message} shadow-lg`
                        : "bg-white border border-gray-200/50 text-gray-900 hover:border-gray-300"
                    }`}
                  >
                    {/* Display file attachments if any */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {message.attachments.map(
                          (attachment: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2 p-2 bg-black/10 rounded-lg backdrop-blur-sm"
                            >
                              {attachment.type.startsWith("image/") ? (
                                <div className="flex items-center space-x-2">
                                  <ImageIcon
                                    size={16}
                                    className={
                                      message.sender === "me"
                                        ? "text-white/70"
                                        : "text-blue-500"
                                    }
                                  />
                                  <img
                                    src={attachment.url}
                                    alt={attachment.name}
                                    className="max-w-48 max-h-32 rounded-lg object-cover shadow-sm"
                                  />
                                </div>
                              ) : (
                                <div className="flex items-center space-x-2">
                                  <File
                                    size={16}
                                    className={
                                      message.sender === "me"
                                        ? "text-white/70"
                                        : "text-gray-500"
                                    }
                                  />
                                  <span className="text-sm truncate max-w-32 font-medium">
                                    {attachment.name}
                                  </span>
                                </div>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    )}

                    {/* Display text message if any */}
                    {message.text && (
                      <p className="text-sm font-medium leading-relaxed">
                        {message.text}
                      </p>
                    )}

                    <div
                      className={`flex items-center justify-end mt-2 space-x-1 ${
                        message.sender === "me"
                          ? "text-white/70"
                          : "text-gray-500"
                      }`}
                    >
                      <span className="text-xs font-medium">
                        {message.timestamp}
                      </span>
                      {message.sender === "me" && (
                        <>
                          {message.status === "sending" && (
                            <Clock
                              size={12}
                              className="text-white/60 animate-pulse"
                            />
                          )}
                          {message.status === "sent" && (
                            <CheckCheck size={12} className="text-white/60" />
                          )}
                          {message.status === "read" && (
                            <CheckCheck size={12} className="text-white" />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {/* Invisible div to scroll to */}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200/50 bg-white shadow-sm">
        {/* File Attachments Preview */}
        {attachedFiles.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {attachedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-3 space-x-2 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center space-x-2">
                  {file.type.startsWith("image/") ? (
                    <ImageIcon size={16} className="text-blue-500" />
                  ) : (
                    <File size={16} className="text-gray-500" />
                  )}
                  <span className="text-sm text-gray-700 truncate max-w-32 font-medium">
                    {file.name}
                  </span>
                </div>
                <button
                  onClick={() => removeAttachedFile(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors duration-200 hover:scale-110"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center space-x-3 relative">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            className="hidden"
            accept="image/*,application/pdf,.doc,.docx,.txt"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-400 hover:text-gray-600 transition-all duration-200 hover:scale-110"
          >
            <Paperclip size={20} />
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type a message..."
              className="w-full px-4 py-3 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all duration-200 pr-12 font-medium placeholder-gray-500"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-gray-400 hover:text-gray-600 transition-all duration-200 hover:scale-110"
              >
                <Smile size={18} />
              </button>

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div
                  ref={emojiPickerRef}
                  className="absolute bottom-12 right-0 bg-white border border-gray-200/50 rounded-2xl shadow-xl p-4 w-72 h-52 overflow-y-auto z-50 backdrop-blur-sm"
                >
                  <div className="grid grid-cols-8 gap-1">
                    {emojis.map((emoji, index) => (
                      <button
                        key={index}
                        onClick={() => handleEmojiSelect(emoji)}
                        className="text-xl hover:bg-gray-100 rounded-lg p-2 transition-all duration-200 hover:scale-110"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {newMessage.trim() || attachedFiles.length > 0 ? (
            <button
              onClick={handleSendMessage}
              disabled={sendingMessage}
              className={`p-3 rounded-2xl text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:scale-100 ${colors.button}`}
            >
              {sendingMessage ? (
                <div className="animate-spin">
                  <Send size={18} />
                </div>
              ) : (
                <Send size={18} />
              )}
            </button>
          ) : null}
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
