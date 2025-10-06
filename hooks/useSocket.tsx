"use client";

import { useEffect, useRef } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import {
  initializeSocket,
  connectSocket,
  disconnectSocket,
  socketEventHandlers,
  socketEmit,
} from "@/lib/socket";

interface Message {
  id: string;
  conversationId: string;
  sender: string;
  content: string;
  timestamp: string;
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
}

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  status: string;
  unread: boolean;
}

interface UseSocketProps {
  onNewMessage?: (message: Message) => void;
  onNewConversation?: (conversation: Conversation) => void;
  onConversationUpdated?: (data: {
    conversationId: string;
    lastMessage: string;
    unread?: boolean;
  }) => void;
  onTypingStart?: (data: { userId: string; conversationId: string }) => void;
  onTypingStop?: (data: { userId: string; conversationId: string }) => void;
  onPaymentStatusUpdate?: (data: {
    messageId?: string;
    paymentId: string;
    status: string;
    message: string;
    paidAt?: string;
    conversationId?: string;
  }) => void;
}

export const useSocket = ({
  onNewMessage,
  onNewConversation,
  onConversationUpdated,
  onTypingStart,
  onTypingStop,
  onPaymentStatusUpdate,
}: UseSocketProps = {}) => {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const socketRef = useRef<ReturnType<typeof initializeSocket> | null>(null);
  const isConnectedRef = useRef(false);
  const initializedRef = useRef(false); // Track if socket was already initialized

  // Initialize socket connection
  useEffect(() => {
    console.log(
      "useSocket effect triggered - isLoaded:",
      isLoaded,
      "user:",
      user ? "YES" : "NO",
      "already initialized:",
      initializedRef.current
    );

    if (!isLoaded || !user) return;
    
    // Prevent re-initialization if already initialized
    if (initializedRef.current && socketRef.current) {
      console.log("⚠️ Socket already initialized, skipping re-initialization");
      return;
    }

    const initSocket = async () => {
      try {
        console.log("Attempting to get token...");
        // Get auth token from Clerk session
        const token = await getToken();
        console.log("Got token:", token ? "YES" : "NO");

        if (token) {
          console.log("Initializing socket with token...");
          socketRef.current = initializeSocket(token);
          console.log("Socket initialized, connecting...");
          connectSocket();
          isConnectedRef.current = true;
          initializedRef.current = true; // Mark as initialized

          console.log("Socket initialized and connected with token");
        } else {
          console.log("No token available, cannot initialize socket");
        }
      } catch (error) {
        console.error("Failed to initialize socket:", error);
      }
    };

    initSocket();

    return () => {
      console.log("useSocket cleanup - disconnecting socket");
      if (isConnectedRef.current) {
        disconnectSocket();
        isConnectedRef.current = false;
        initializedRef.current = false; // Reset initialization flag
        socketRef.current = null;
      }
    };
  }, [isLoaded, user]); // Remove getToken from dependencies to prevent re-initialization

  // Set up event listeners
  useEffect(() => {
    if (!socketRef.current) {
      console.log("⚠️ No socket available for event listeners");
      return;
    }

    console.log("🔧 Setting up socket event listeners");

    // Connection events
    socketEventHandlers.onConnect(() => {
      console.log("✅ Socket connected successfully");
      isConnectedRef.current = true;
    });

    socketEventHandlers.onDisconnect(() => {
      console.log("❌ Socket disconnected");
      isConnectedRef.current = false;
    });

    // Message events
    if (onNewMessage) {
      console.log("📝 Setting up onNewMessage handler");
      socketEventHandlers.onNewMessage((message) => {
        console.log("🎯 Socket event: newMessage received", {
          messageId: message._id || message.id,
          conversationId: message.conversationId,
          content: message.content?.substring(0, 50) + "...",
          sender: message.sender,
          timestamp: new Date().toISOString(),
          fullMessage: message
        });
        console.log("📞 Calling onNewMessage callback with message:", message);
        onNewMessage(message);
      });
    }

    if (onNewConversation) {
      console.log("💬 Setting up onNewConversation handler");
      socketEventHandlers.onNewConversation(onNewConversation);
    }

    if (onConversationUpdated) {
      console.log("🔄 Setting up onConversationUpdated handler");
      socketEventHandlers.onConversationUpdated((data) => {
        console.log("🎯 Socket event: conversationUpdated received", {
          conversationId: data.conversationId,
          lastMessage: data.lastMessage?.substring(0, 50) + "...",
          unread: data.unread,
          timestamp: new Date().toISOString(),
        });
        console.log(
          "📞 Calling onConversationUpdated callback with data:",
          data
        );
        onConversationUpdated(data);
      });
    }

    // Typing events
    if (onTypingStart) {
      socketEventHandlers.onTypingStart(onTypingStart);
    }

    if (onTypingStop) {
      socketEventHandlers.onTypingStop(onTypingStop);
    }

    if (onPaymentStatusUpdate) {
      console.log("💳 Setting up onPaymentStatusUpdate handler");
      socketEventHandlers.onPaymentStatusUpdate((data) => {
        console.log("🎯 Socket event: paymentStatusUpdate received", {
          messageId: data.messageId,
          paymentId: data.paymentId,
          status: data.status,
          conversationId: data.conversationId,
          timestamp: new Date().toISOString(),
        });
        console.log(
          "📞 Calling onPaymentStatusUpdate callback with data:",
          data
        );
        onPaymentStatusUpdate(data);
      });
    }

    // Cleanup event listeners
    return () => {
      socketEventHandlers.offConnect();
      socketEventHandlers.offDisconnect();
      socketEventHandlers.offNewMessage();
      socketEventHandlers.offNewConversation();
      socketEventHandlers.offConversationUpdated();
      socketEventHandlers.offTypingStart();
      socketEventHandlers.offTypingStop();
      socketEventHandlers.offPaymentStatusUpdate();
    };
  }, [
    onNewMessage,
    onNewConversation,
    onConversationUpdated,
    onTypingStart,
    onTypingStop,
    onPaymentStatusUpdate,
  ]);

  // Socket emit functions
  const joinConversation = (conversationId: string) => {
    console.log(
      "🏠 Attempting to join conversation:",
      conversationId,
      "Connected:",
      isConnectedRef.current
    );
    if (isConnectedRef.current && socketRef.current?.connected) {
      console.log("✅ Emitting joinConversation event");
      socketEmit.joinConversation(conversationId);
    } else {
      console.log("❌ Cannot join conversation - socket not connected");
    }
  };

  const leaveConversation = (conversationId: string) => {
    console.log(
      "🚪 Attempting to leave conversation:",
      conversationId,
      "Connected:",
      isConnectedRef.current
    );
    if (isConnectedRef.current && socketRef.current?.connected) {
      console.log("✅ Emitting leaveConversation event");
      socketEmit.leaveConversation(conversationId);
    } else {
      console.log("❌ Cannot leave conversation - socket not connected");
    }
  };

  const startTyping = (conversationId: string) => {
    if (isConnectedRef.current) {
      socketEmit.startTyping(conversationId);
    }
  };

  const stopTyping = (conversationId: string) => {
    if (isConnectedRef.current) {
      socketEmit.stopTyping(conversationId);
    }
  };

  return {
    isConnected: isConnectedRef.current,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
    socket: socketRef.current,
  };
};
