import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initializeSocket = (token?: string) => {
  if (socket) {
    console.log("🔄 Disconnecting existing socket");
    socket.disconnect();
  }

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const socketUrl = API_BASE_URL.replace("/api/v1", "");

  console.log("🚀 Initializing socket with URL:", socketUrl);
  console.log("🔑 Token available:", token ? "YES" : "NO");
  console.log("🔑 Token preview:", token ? `${token.substring(0, 20)}...` : "N/A");

  socket = io(socketUrl, {
    auth: {
      token: token,
    },
    autoConnect: false,
    transports: ['websocket', 'polling'], // Add fallback transport
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected successfully with ID:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("🚨 Socket connection error:", error);
    console.error("🚨 Error details:", error.message);
  });

  return socket;
};

export const getSocket = () => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const connectSocket = () => {
  if (socket && !socket.connected) {
    socket.connect();
  }
};

// Socket event handlers
export const socketEventHandlers = {
  onConnect: (callback: () => void) => {
    socket?.on("connect", callback);
  },
  
  onDisconnect: (callback: () => void) => {
    socket?.on("disconnect", callback);
  },
  
  onNewMessage: (callback: (message: any) => void) => {
    console.log("🔧 Setting up newMessage event listener");
    socket?.on("newMessage", (message) => {
      console.log("🎯 Raw socket event: newMessage", message);
      callback(message);
    });
  },
  
  onNewConversation: (callback: (conversation: any) => void) => {
    socket?.on("newConversation", callback);
  },
  
  onConversationUpdated: (callback: (data: { conversationId: string; lastMessage: string; unread?: boolean }) => void) => {
    socket?.on("conversationUpdated", callback);
  },
  
  onTypingStart: (callback: (data: { userId: string; conversationId: string }) => void) => {
    socket?.on("typing:start", callback);
  },
  
  onTypingStop: (callback: (data: { userId: string; conversationId: string }) => void) => {
    socket?.on("typing:stop", callback);
  },
  
  // Remove event listeners
  offConnect: () => {
    socket?.off("connect");
  },
  
  offDisconnect: () => {
    socket?.off("disconnect");
  },
  
  offNewMessage: () => {
    socket?.off("newMessage");
  },
  
  offNewConversation: () => {
    socket?.off("newConversation");
  },
  
  offConversationUpdated: () => {
    socket?.off("conversationUpdated");
  },
  
  offTypingStart: () => {
    socket?.off("typing:start");
  },
  
  offTypingStop: () => {
    socket?.off("typing:stop");
  },
};

// Socket emit functions
export const socketEmit = {
  joinConversation: (conversationId: string) => {
    console.log("📡 Emitting joinConversation event:", conversationId);
    socket?.emit("joinConversation", conversationId);
  },
  
  leaveConversation: (conversationId: string) => {
    console.log("📡 Emitting leaveConversation event:", conversationId);
    socket?.emit("leaveConversation", conversationId);
  },
  
  startTyping: (conversationId: string) => {
    socket?.emit("typing:start", { conversationId });
  },
  
  stopTyping: (conversationId: string) => {
    socket?.emit("typing:stop", { conversationId });
  },
};
