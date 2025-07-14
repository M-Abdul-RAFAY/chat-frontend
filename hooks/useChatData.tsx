"use client";
import { useState, useEffect, useCallback } from "react";
import {
  initializeSocket,
  socketEventHandlers,
  connectSocket,
  disconnectSocket,
  joinConversation,
} from "@/lib/socket";
import { useAuth } from "@clerk/nextjs";

export interface Message {
  id: string;
  sender: string;
  content: string;
  time: string;
  avatar?: string;
  isSystem?: boolean;
  isPayment?: boolean;
  subtitle?: string;
  type?: "text" | "payment" | "system";
  paymentData?: {
    paymentId: string;
    amount: string;
    currency: string;
    description: string;
    invoiceNumber: string;
    paymentUrl: string;
    status: string;
    dueDate?: string;
  };
  timestamp?: string;
}

export interface Conversation {
  id: string;
  name: string;
  avatar: string;
  time: string;
  lastMessage: string;
  status: string | null;
  statusColor: string | null;
  unread: boolean;
  location: string;
  messages: Message[];
}

interface ChatDataContext {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  addMessage: (conversationId: string, message: Message) => void;
  markAsRead: (conversationId: string) => void;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
}

export function useChatData(): ChatDataContext {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "NEW LEAD":
        return "bg-orange-500";
      case "WON":
        return "bg-green-600";
      case "PAYMENT SENT":
        return "bg-green-500";
      case "LOST":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Initialize socket connection
  useEffect(() => {
    const initSocket = async () => {
      try {
        const token = await getToken();
        if (token) {
          const socket = initializeSocket(token);
          connectSocket();

          // Set up socket event listeners
          socketEventHandlers.onNewMessage((message: any) => {
            console.log("Socket: Received message with payment data:", message);
            setConversations((prev) =>
              prev.map((conv) =>
                conv.id === message.conversationId
                  ? {
                      ...conv,
                      messages: [
                        ...conv.messages,
                        {
                          id:
                            message._id ||
                            message.id ||
                            Math.random().toString(),
                          sender: message.sender || "customer",
                          content: message.content || message.text || "",
                          time: message.createdAt
                            ? new Date(message.createdAt).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : new Date().toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              }),
                          avatar:
                            message.avatar ||
                            (message.sender === "agent" ? "A" : "C"),
                          isSystem: message.isSystem || false,
                          isPayment:
                            message.type === "payment" ||
                            message.isPayment ||
                            false,
                          subtitle: message.subtitle || "",
                          type: message.type || "text",
                          paymentData: message.paymentData,
                          timestamp:
                            message.createdAt || new Date().toISOString(),
                        },
                      ],
                    }
                  : conv
              )
            );
          });

          socketEventHandlers.onNewConversation((conversation: any) => {
            const mappedConversation = {
              id: conversation._id || conversation.id || "",
              name:
                conversation.customerId?.name ||
                conversation.customerName ||
                "Unknown Customer",
              avatar: (
                conversation.customerId?.name ||
                conversation.customerName ||
                "U"
              )
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase(),
              time: conversation.updatedAt
                ? new Date(conversation.updatedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "",
              lastMessage: conversation.lastMessage || "No messages yet",
              status: conversation.status || null,
              statusColor: getStatusColor(conversation.status),
              unread: conversation.unread || false,
              location:
                conversation.customerId?.location ||
                conversation.location ||
                "",
              messages: [],
            };
            setConversations((prev) => [mappedConversation, ...prev]);
          });

          socketEventHandlers.onConnect(() => {
            console.log("Socket connected");
          });

          socketEventHandlers.onDisconnect(() => {
            console.log("Socket disconnected");
          });

          // Payment status update handler
          socketEventHandlers.onPaymentStatusUpdate(
            (data: {
              messageId?: string;
              paymentId: string;
              status: string;
              message: string;
              paidAt?: string;
              conversationId?: string;
            }) => {
              console.log("💳 Payment status update received:", data);
              setConversations((prev) =>
                prev.map((conv) =>
                  conv.id === data.conversationId
                    ? {
                        ...conv,
                        messages: conv.messages.map((msg) => {
                          if (msg.id === data.messageId && msg.paymentData) {
                            console.log("💰 Updating message payment status:", {
                              messageId: msg.id,
                              oldStatus: msg.paymentData.status,
                              newStatus: data.status,
                            });

                            return {
                              ...msg,
                              paymentData: {
                                ...msg.paymentData,
                                status: data.status,
                              },
                            };
                          }
                          return msg;
                        }),
                      }
                    : conv
                )
              );

              // Show success notification
              if (data.status === "completed") {
                console.log("✅ Payment completed successfully!");
                // You can add a toast notification here if you have one
              }
            }
          );
        }
      } catch (error) {
        console.error("Error initializing socket:", error);
      }
    };

    initSocket();

    return () => {
      disconnectSocket();
    };
  }, [getToken]);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1") +
          "/conversations",
        {
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }
        throw new Error(
          `Failed to fetch conversations: ${response.statusText}`
        );
      }

      const data = await response.json();

      const mapped = data.map((conv: any) => ({
        id: conv._id || conv.id || "",
        name: conv.customerId?.name || conv.customerName || "Unknown Customer",
        avatar: (conv.customerId?.name || conv.customerName || "U")
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase(),
        time: conv.updatedAt
          ? new Date(conv.updatedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
        lastMessage: conv.lastMessage || "No messages yet",
        status: conv.status || null,
        statusColor: getStatusColor(conv.status),
        unread: conv.unread || false,
        location: conv.customerId?.location || conv.location || "",
        messages: [], // Messages will be loaded separately when conversation is selected
      }));

      setConversations(mapped);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load conversations"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      // Join the conversation room for real-time updates
      joinConversation(conversationId);

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"
        }/conversations/${conversationId}/messages`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }

      const messages = await response.json();

      const mappedMessages = messages.map((msg: any) => ({
        id: msg._id || msg.id || Math.random().toString(),
        sender: msg.sender || "customer",
        content: msg.content || msg.text || "",
        time: msg.createdAt
          ? new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
        avatar: msg.avatar || (msg.sender === "agent" ? "A" : "C"),
        isSystem: msg.isSystem || false,
        isPayment: msg.type === "payment" || msg.isPayment || false,
        subtitle: msg.subtitle || "",
        type: msg.type || "text",
        paymentData: msg.paymentData,
        timestamp: msg.createdAt || new Date().toISOString(),
      }));

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId
            ? { ...conv, messages: mappedMessages }
            : conv
        )
      );
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError(err instanceof Error ? err.message : "Failed to load messages");
    }
  }, []);

  const addMessage = useCallback((conversationId: string, message: Message) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: [...conv.messages, message],
              lastMessage: message.content,
              time: message.time,
              unread: false,
            }
          : conv
      )
    );
  }, []);

  const sendMessage = useCallback(
    async (conversationId: string, content: string) => {
      try {
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"
          }/messages`,
          {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
              conversationId,
              content,
              type: "text",
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to send message: ${response.statusText}`);
        }

        const newMessage = await response.json();

        const mappedMessage: Message = {
          id: newMessage._id || newMessage.id || Math.random().toString(),
          sender: "agent",
          content: content,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          avatar: "A",
        };

        addMessage(conversationId, mappedMessage);
      } catch (err) {
        console.error("Error sending message:", err);
        setError(err instanceof Error ? err.message : "Failed to send message");
        throw err;
      }
    },
    [addMessage]
  );

  const markAsRead = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, unread: false } : conv
      )
    );
  }, []);

  const refreshConversations = useCallback(async () => {
    await fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    loading,
    error,
    addMessage,
    markAsRead,
    sendMessage,
    fetchMessages,
    refreshConversations,
  };
}
