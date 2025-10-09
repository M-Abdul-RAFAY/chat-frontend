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
    socket?.off("connect"); // Remove old listeners
    socket?.on("connect", callback);
  },

  onDisconnect: (callback: () => void) => {
    socket?.off("disconnect"); // Remove old listeners
    socket?.on("disconnect", callback);
  },

  onNewMessage: (callback: (message: any) => void) => {
    console.log("🔧 Setting up newMessage event listener");
    socket?.off("newMessage"); // Remove old listeners
    socket?.on("newMessage", (message) => {
      console.log("🎯 Raw socket event: newMessage", message);
      callback(message);
    });
  },

  onNewConversation: (callback: (conversation: any) => void) => {
    socket?.off("newConversation"); // Remove old listeners
    socket?.on("newConversation", callback);
  },

  onConversationUpdated: (
    callback: (data: {
      conversationId: string;
      lastMessage: string;
      unread?: boolean;
    }) => void
  ) => {
    socket?.off("conversationUpdated"); // Remove old listeners
    socket?.on("conversationUpdated", callback);
  },

  onTypingStart: (
    callback: (data: { userId: string; conversationId: string }) => void
  ) => {
    socket?.off("typing:start"); // Remove old listeners
    socket?.on("typing:start", callback);
  },

  onTypingStop: (
    callback: (data: { userId: string; conversationId: string }) => void
  ) => {
    socket?.off("typing:stop"); // Remove old listeners
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
    socket?.off("paymentStatusUpdate"); // Remove old listeners
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

  // Voice call event listeners
  onCallInitiated: (
    callback: (data: {
      callId: string;
      status: string;
      to: string;
      from: string;
    }) => void
  ) => {
    console.log("🔧 Setting up call:initiated event listener");
    socket?.off("call:initiated");
    socket?.on("call:initiated", (data) => {
      console.log("📞 Raw socket event: call:initiated", data);
      callback(data);
    });
  },

  onCallStatusUpdate: (
    callback: (data: {
      callId: string;
      status: string;
      duration?: number;
      answeredAt?: string;
    }) => void
  ) => {
    console.log("🔧 Setting up call:statusUpdate event listener");
    socket?.off("call:statusUpdate");
    socket?.on("call:statusUpdate", (data) => {
      console.log("📞 Raw socket event: call:statusUpdate", data);
      callback(data);
    });
  },

  onCallEnded: (
    callback: (data: {
      callId: string;
      status: string;
      duration: number;
    }) => void
  ) => {
    console.log("🔧 Setting up call:ended event listener");
    socket?.off("call:ended");
    socket?.on("call:ended", (data) => {
      console.log("📞 Raw socket event: call:ended", data);
      callback(data);
    });
  },

  onIncomingCall: (
    callback: (data: {
      callId: string;
      conversationId: string;
      customerId: string;
      from: string;
      to: string;
      customerName: string;
    }) => void
  ) => {
    console.log("🔧 Setting up call:incoming event listener");
    socket?.off("call:incoming");
    socket?.on("call:incoming", (data) => {
      console.log("📞 Raw socket event: call:incoming", data);
      callback(data);
    });
  },

  onCallRecordingReady: (
    callback: (data: {
      callId: string;
      recordingUrl: string;
      duration: number;
    }) => void
  ) => {
    console.log("🔧 Setting up call:recordingReady event listener");
    socket?.off("call:recordingReady");
    socket?.on("call:recordingReady", (data) => {
      console.log("📞 Raw socket event: call:recordingReady", data);
      callback(data);
    });
  },

  onCallAccepted: (
    callback: (data: { callId: string; userId: string }) => void
  ) => {
    console.log("🔧 Setting up call:accepted event listener");
    socket?.off("call:accepted");
    socket?.on("call:accepted", (data) => {
      console.log("📞 Raw socket event: call:accepted", data);
      callback(data);
    });
  },

  onCallRejected: (
    callback: (data: { callId: string; userId: string }) => void
  ) => {
    console.log("🔧 Setting up call:rejected event listener");
    socket?.off("call:rejected");
    socket?.on("call:rejected", (data) => {
      console.log("📞 Raw socket event: call:rejected", data);
      callback(data);
    });
  },

  onCallMuteUpdate: (
    callback: (data: { callId: string; userId: string; muted: boolean }) => void
  ) => {
    console.log("🔧 Setting up call:muteUpdate event listener");
    socket?.off("call:muteUpdate");
    socket?.on("call:muteUpdate", (data) => {
      console.log("📞 Raw socket event: call:muteUpdate", data);
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

  // Remove voice call event listeners
  offCallInitiated: () => {
    socket?.off("call:initiated");
  },

  offCallStatusUpdate: () => {
    socket?.off("call:statusUpdate");
  },

  offCallEnded: () => {
    socket?.off("call:ended");
  },

  offIncomingCall: () => {
    socket?.off("call:incoming");
  },

  offCallRecordingReady: () => {
    socket?.off("call:recordingReady");
  },

  offCallAccepted: () => {
    socket?.off("call:accepted");
  },

  offCallRejected: () => {
    socket?.off("call:rejected");
  },

  offCallMuteUpdate: () => {
    socket?.off("call:muteUpdate");
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
