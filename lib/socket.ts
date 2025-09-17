import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initializeSocket = (token?: string) => {
  if (socket) {
    console.log("🔄 Disconnecting existing socket");
    socket.disconnect();
  }

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const socketUrl = API_BASE_URL.replace("/api/v1", "");

  console.log("🚀 Initializing socket with URL:", socketUrl);
  console.log("🔑 Token available:", token ? "YES" : "NO");
  console.log(
    "🔑 Token preview:",
    token ? `${token.substring(0, 20)}...` : "N/A"
  );

  socket = io(socketUrl, {
    auth: {
      token: token,
    },
    autoConnect: false,
    transports: ["websocket", "polling"], // Add fallback transport
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

  onConversationUpdated: (
    callback: (data: {
      conversationId: string;
      lastMessage: string;
      unread?: boolean;
    }) => void
  ) => {
    socket?.on("conversationUpdated", callback);
  },

  onTypingStart: (
    callback: (data: { userId: string; conversationId: string }) => void
  ) => {
    socket?.on("typing:start", callback);
  },

  onTypingStop: (
    callback: (data: { userId: string; conversationId: string }) => void
  ) => {
    socket?.on("typing:stop", callback);
  },

  onPaymentStatusUpdate: (
    callback: (data: {
      messageId?: string;
      paymentId: string;
      status: string;
      message: string;
      paidAt?: string;
      conversationId?: string;
    }) => void
  ) => {
    console.log("🔧 Setting up paymentStatusUpdate event listener");
    socket?.on("paymentStatusUpdate", (data) => {
      console.log("💳 Raw socket event: paymentStatusUpdate", data);
      callback(data);
    });
  },

  onNewFacebookMessage: (
    callback: (data: {
      conversationId: string;
      message: any;
      platform: string;
    }) => void
  ) => {
    console.log("🔧 Setting up Facebook message event listener");
    socket?.on("new_facebook_message", (data) => {
      console.log("📘 Raw socket event: new_facebook_message", data);
      callback(data);
    });
  },

  onNewInstagramMessage: (
    callback: (data: {
      conversationId: string;
      message: any;
      platform: string;
    }) => void
  ) => {
    console.log("🔧 Setting up Instagram message event listener");
    socket?.on("new_instagram_message", (data) => {
      console.log("📷 Raw socket event: new_instagram_message", data);
      callback(data);
    });
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

  offPaymentStatusUpdate: () => {
    socket?.off("paymentStatusUpdate");
  },

  offNewFacebookMessage: () => {
    socket?.off("new_facebook_message");
  },

  offNewInstagramMessage: () => {
    socket?.off("new_instagram_message");
  },

  // Instagram conversation events
  onNewInstagramConversation: (callback: (conversation: any) => void) => {
    console.log("🔧 Setting up newInstagramConversation event listener");
    socket?.on("newInstagramConversation", (conversation) => {
      console.log(
        "📷 Raw socket event: newInstagramConversation",
        conversation
      );
      callback(conversation);
    });
  },

  offNewInstagramConversation: () => {
    socket?.off("newInstagramConversation");
  },
};

export const joinConversation = (conversationId: string) => {
  if (socket && socket.connected) {
    console.log("🔗 Joining conversation room:", conversationId);
    socket.emit("joinConversation", conversationId);
  } else {
    console.warn("❌ Cannot join conversation - socket not connected");
  }
};

export const leaveConversation = (conversationId: string) => {
  if (socket && socket.connected) {
    console.log("🚪 Leaving conversation room:", conversationId);
    socket.emit("leaveConversation", conversationId);
  } else {
    console.warn("❌ Cannot leave conversation - socket not connected");
  }
};

// Socket emit object with specific methods
export const socketEmit = {
  joinConversation: (conversationId: string) => {
    if (socket && socket.connected) {
      console.log("🔗 Joining conversation:", conversationId);
      socket.emit("joinConversation", conversationId);
    }
  },

  leaveConversation: (conversationId: string) => {
    if (socket && socket.connected) {
      console.log("🚪 Leaving conversation:", conversationId);
      socket.emit("leaveConversation", conversationId);
    }
  },

  startTyping: (conversationId: string) => {
    if (socket && socket.connected) {
      console.log("⌨️ Start typing in conversation:", conversationId);
      socket.emit("typing:start", { conversationId });
    }
  },

  stopTyping: (conversationId: string) => {
    if (socket && socket.connected) {
      console.log("⌨️ Stop typing in conversation:", conversationId);
      socket.emit("typing:stop", { conversationId });
    }
  },
};

// Facebook message event handlers
export const onNewFacebookMessage = (callback: (data: unknown) => void) => {
  if (socket) {
    console.log("🔧 Setting up newFacebookMessage event listener");
    socket.on("newFacebookMessage", (data) => {
      console.log("🎯 Raw Facebook message event:", data);
      callback(data);
    });
  }
};

export const offNewFacebookMessage = (callback: (data: unknown) => void) => {
  if (socket) {
    socket.off("newFacebookMessage", callback);
  }
};

export const genericSocketEmit = (event: string, data: unknown) => {
  if (socket && socket.connected) {
    console.log("📤 Emitting socket event:", event, data);
    socket.emit(event, data);
  } else {
    console.warn("❌ Cannot emit event - socket not connected");
  }
};

// Social Media Event Handlers
export const onRefreshFacebookChat = (callback: (data: unknown) => void) => {
  if (socket) {
    console.log("🔧 Setting up refresh_facebook_chat event listener");
    socket.on("refresh_facebook_chat", (data) => {
      console.log("🎯 Facebook chat refresh event received:", data);
      callback(data);
    });
  }
};

export const offRefreshFacebookChat = (callback: (data: unknown) => void) => {
  if (socket) {
    console.log("🔧 Removing refresh_facebook_chat event listener");
    socket.off("refresh_facebook_chat", callback);
  }
};

export const onRefreshInstagramChat = (callback: (data: unknown) => void) => {
  if (socket) {
    console.log("🔧 Setting up refresh_instagram_chat event listener");
    socket.on("refresh_instagram_chat", (data) => {
      console.log("🎯 Instagram chat refresh event received:", data);
      callback(data);
    });
  }
};

export const offRefreshInstagramChat = (callback: (data: unknown) => void) => {
  if (socket) {
    console.log("🔧 Removing refresh_instagram_chat event listener");
    socket.off("refresh_instagram_chat", callback);
  }
};

export const onNewSocialMessage = (callback: (data: unknown) => void) => {
  if (socket) {
    console.log("🔧 Setting up new_social_message event listener");
    socket.on("new_social_message", (data) => {
      console.log("🎯 New social message event received:", data);
      callback(data);
    });
  }
};

export const offNewSocialMessage = (callback: (data: unknown) => void) => {
  if (socket) {
    console.log("🔧 Removing new_social_message event listener");
    socket.off("new_social_message", callback);
  }
};

export const onNewFacebookMessageEvent = (
  callback: (data: unknown) => void
) => {
  if (socket) {
    console.log("🔧 Setting up new_facebook_message event listener");
    socket.on("new_facebook_message", (data) => {
      console.log("🎯 New Facebook message event received:", data);
      callback(data);
    });
  }
};

export const offNewFacebookMessageEvent = (
  callback: (data: unknown) => void
) => {
  if (socket) {
    console.log("🔧 Removing new_facebook_message event listener");
    socket.off("new_facebook_message", callback);
  }
};

export const onNewInstagramMessageEvent = (
  callback: (data: unknown) => void
) => {
  if (socket) {
    console.log("🔧 Setting up new_instagram_message event listener");
    socket.on("new_instagram_message", (data) => {
      console.log("🎯 New Instagram message event received:", data);
      callback(data);
    });
  }
};

export const offNewInstagramMessageEvent = (
  callback: (data: unknown) => void
) => {
  if (socket) {
    console.log("🔧 Removing new_instagram_message event listener");
    socket.off("new_instagram_message", callback);
  }
};
