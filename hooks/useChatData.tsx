"use client";
import { useState, useEffect, useCallback } from "react";

export interface Message {
  id: string;
  sender: string;
  content: string;
  time: string;
  avatar?: string;
  isSystem?: boolean;
  isPayment?: boolean;
  subtitle?: string;
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

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        (process.env.NEXT_PUBLIC_API_URL ||
          "https://hivechat-2de5.onrender.com/api/v1") + "/conversations",
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
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL ||
          "https://hivechat-2de5.onrender.com/api/v1"
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
        isPayment: msg.isPayment || false,
        subtitle: msg.subtitle || "",
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

  const sendMessage = useCallback(
    async (conversationId: string, content: string) => {
      try {
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL ||
            "https://hivechat-2de5.onrender.com/api/v1"
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
    []
  );

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
