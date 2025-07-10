"use client";

import { useEffect, useRef } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { 
  initializeSocket, 
  connectSocket, 
  disconnectSocket,
  socketEventHandlers,
  socketEmit
} from "@/lib/socket";

interface Message {
  id: string;
  conversationId: string;
  sender: string;
  content: string;
  timestamp: string;
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
  onConversationUpdated?: (data: { conversationId: string; lastMessage: string; unread?: boolean }) => void;
  onTypingStart?: (data: { userId: string; conversationId: string }) => void;
  onTypingStop?: (data: { userId: string; conversationId: string }) => void;
}

export const useSocket = ({
  onNewMessage,
  onNewConversation,
  onConversationUpdated,
  onTypingStart,
  onTypingStop,
}: UseSocketProps = {}) => {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const socketRef = useRef<ReturnType<typeof initializeSocket> | null>(null);
  const isConnectedRef = useRef(false);

  // Initialize socket connection
  useEffect(() => {
    console.log("useSocket effect triggered - isLoaded:", isLoaded, "user:", user ? "YES" : "NO");
    
    if (!isLoaded || !user) return;

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
      console.log("useSocket cleanup");
      if (isConnectedRef.current) {
        disconnectSocket();
        isConnectedRef.current = false;
        socketRef.current = null;
      }
    };
  }, [isLoaded, user, getToken]);

  // Set up event listeners
  useEffect(() => {
    if (!socketRef.current) return;

    // Connection events
    socketEventHandlers.onConnect(() => {
      console.log("Socket connected");
      isConnectedRef.current = true;
    });

    socketEventHandlers.onDisconnect(() => {
      console.log("Socket disconnected");
      isConnectedRef.current = false;
    });

    // Message events
    if (onNewMessage) {
      socketEventHandlers.onNewMessage(onNewMessage);
    }

    if (onNewConversation) {
      socketEventHandlers.onNewConversation(onNewConversation);
    }

    if (onConversationUpdated) {
      socketEventHandlers.onConversationUpdated(onConversationUpdated);
    }

    // Typing events
    if (onTypingStart) {
      socketEventHandlers.onTypingStart(onTypingStart);
    }

    if (onTypingStop) {
      socketEventHandlers.onTypingStop(onTypingStop);
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
    };
  }, [onNewMessage, onNewConversation, onConversationUpdated, onTypingStart, onTypingStop]);

  // Socket emit functions
  const joinConversation = (conversationId: string) => {
    if (isConnectedRef.current) {
      socketEmit.joinConversation(conversationId);
    }
  };

  const leaveConversation = (conversationId: string) => {
    if (isConnectedRef.current) {
      socketEmit.leaveConversation(conversationId);
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
