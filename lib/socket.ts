import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initializeSocket = (token?: string) => {
  if (socket) {
    socket.disconnect();
  }

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const socketUrl = API_BASE_URL.replace("/api/v1", "");

  console.log("Initializing socket with URL:", socketUrl);
  console.log("Token available:", token ? "YES" : "NO");

  socket = io(socketUrl, {
    auth: {
      token: token,
    },
    autoConnect: false,
  });

  socket.on("connect", () => {
    console.log("Socket connected successfully");
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
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
    socket?.on("newMessage", callback);
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
    socket?.emit("joinConversation", conversationId);
  },
  
  leaveConversation: (conversationId: string) => {
    socket?.emit("leaveConversation", conversationId);
  },
  
  startTyping: (conversationId: string) => {
    socket?.emit("typing:start", { conversationId });
  },
  
  stopTyping: (conversationId: string) => {
    socket?.emit("typing:stop", { conversationId });
  },
};
