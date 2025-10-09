// API configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

// Helper function to get auth headers (client-side)
export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  try {
    console.log("🔐 Getting auth headers...");

    // Check if we're on the client side
    if (typeof window !== "undefined") {
      console.log("🌐 Client side detected");

      // Check if Clerk is available
      const clerk = (window as any).Clerk;
      if (clerk && clerk.session) {
        console.log("🎫 Clerk session found");
        try {
          const token = await clerk.session.getToken();
          console.log("🔑 Got Clerk token:", token ? "YES" : "NO");
          console.log(
            "🔑 Token preview:",
            token ? token.substring(0, 20) + "..." : "NONE"
          );

          if (token) {
            const headers = {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            };
            console.log("✅ Auth headers prepared with token");
            return headers;
          }
        } catch (tokenError) {
          console.error("❌ Error getting Clerk token:", tokenError);
        }
      } else {
        console.log("❌ No Clerk session found");
        console.log("🔍 Clerk status:", {
          hasClerk: !!clerk,
          hasSession: !!clerk?.session,
          clerkLoaded: clerk?.loaded,
        });
      }
    } else {
      console.log("🖥️ Server side detected");
    }

    console.log("🔄 No Clerk token available - using fallback");
    // If no token, return headers without Authorization
    return {
      "Content-Type": "application/json",
    };
  } catch (error) {
    console.error("💥 Error getting auth headers:", error);
    // Never throw, just return Content-Type for public routes
    return {
      "Content-Type": "application/json",
    };
  }
};

// User management API functions
export const userAPI = {
  // Sync current user with backend
  syncUser: async (userData: {
    clerkId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
    userId?: string;
  }) => {
    try {
      const response = await fetch("/api/auth/sync-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userData }),
      });

      if (!response.ok) {
        throw new Error(`Failed to sync user: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error syncing user:", error);
      throw error;
    }
  },

  // Get user from backend
  getUser: async () => {
    try {
      const response = await fetch("/api/auth/get-user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get user: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting user:", error);
      throw error;
    }
  },
};

// Types for API responses
export interface Conversation {
  id: string; // Changed from number to string
  _id?: string; // MongoDB ObjectId
  name: string;
  avatar: string;
  time: string;
  lastMessage: string;
  status: string;
  statusColor: string;
  unread: boolean;
  location: string;
  phone?: string; // Customer phone number
  email?: string; // Customer email
  messages: Message[];
}

export interface Message {
  id: string;
  sender: "customer" | "agent" | "system";
  content: string;
  time: string;
  timestamp?: string;
  edited?: boolean;
  isSystem?: boolean;
  avatar?: string;
  _id?: string; // MongoDB ID
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
  isPayment?: boolean;
}

export interface SendMessageRequest {
  conversationId: string; // Changed from number to string
  content: string;
  sender: "agent";
}

// API functions for inbox/chat functionality
export const chatAPI = {
  // Get all conversations for the inbox
  getConversations: async (): Promise<Conversation[]> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/conversations`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch conversations: ${response.statusText}`
        );
      }

      const conversations = await response.json();

      // Map _id to id for frontend compatibility
      return conversations.map((conv: { _id: string; [key: string]: any }) => ({
        ...conv,
        id: conv._id.toString(),
        _id: conv._id.toString(), // Preserve _id for backend compatibility
      }));
    } catch (error) {
      console.error("Error fetching conversations:", error);
      throw error;
    }
  },

  // Get a specific conversation with all messages
  getConversation: async (conversationId: string): Promise<Conversation> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/conversations/${conversationId}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch conversation: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching conversation:", error);
      throw error;
    }
  },

  // Send a new message in a conversation
  sendMessage: async (data: SendMessageRequest): Promise<Message> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/conversations/${data.conversationId}/messages`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            content: data.content,
            sender: data.sender,
            timestamp: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },

  // Mark conversation as read
  markAsRead: async (conversationId: string): Promise<void> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/conversations/${conversationId}/read`,
        {
          method: "PATCH",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to mark as read: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error marking conversation as read:", error);
      throw error;
    }
  },

  // Update conversation status (e.g., NEW LEAD, QUALIFIED, etc.)
  updateConversationStatus: async (
    conversationId: string,
    status: string
  ): Promise<void> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/conversations/${conversationId}/status`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error updating conversation status:", error);
      throw error;
    }
  },

  // Get real-time updates (for WebSocket or polling)
  subscribeToUpdates: (
    conversationId: number,
    callback: (message: Message) => void
  ) => {
    // This would typically use WebSocket for real-time updates
    // For now, implementing polling as fallback
    const pollInterval = setInterval(async () => {
      try {
        const conversation = await chatAPI.getConversation(conversationId);
        // You'd need to implement logic to detect new messages
        // and call the callback with new messages
      } catch (error) {
        console.error("Error polling for updates:", error);
      }
    }, 3000); // Poll every 3 seconds

    // Return cleanup function
    return () => clearInterval(pollInterval);
  },

  // Add this method to chatAPI
  sendExternalMessage: async (
    platform: "whatsapp" | "sms",
    phone: string,
    message: string
  ) => {
    const url =
      platform === "whatsapp"
        ? `${API_BASE_URL}/chat/whatsapp/send`
        : `${API_BASE_URL}/chat/sms/send`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, message }),
    });

    if (!res.ok) {
      throw new Error(`Failed to send ${platform} message`);
    }

    return await res.json();
  },

  // Add missing methods for ChatInterface
  editMessage: async (messageId: string, newContent: string): Promise<void> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ content: newContent }),
      });

      if (!response.ok) {
        throw new Error(`Failed to edit message: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error editing message:", error);
      throw error;
    }
  },

  deleteMessage: async (messageId: string): Promise<void> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to delete message: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      throw error;
    }
  },

  clearChat: async (conversationId: string): Promise<void> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/conversations/${conversationId}/clear`,
        {
          method: "DELETE",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to clear chat: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error clearing chat:", error);
      throw error;
    }
  },

  deleteConversation: async (conversationId: string): Promise<void> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/conversations/${conversationId}`,
        {
          method: "DELETE",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to delete conversation: ${response.statusText}`
        );
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
      throw error;
    }
  },
};

// Widget API functions
export const widgetAPI = {
  // Get user's widget configuration
  getWidgetConfig: async (
    userId?: string
  ): Promise<{ widgetId: string; config: any }> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/widget/config`, {
        method: "POST",
        headers,
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch widget config: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching widget config:", error);
      throw error;
    }
  },

  // Generate/regenerate widget for user
  generateWidget: async (
    userId?: string
  ): Promise<{
    widgetId: string;
    embedCode: string;
  }> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/widget/generate`, {
        method: "POST",
        headers,
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate widget: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error generating widget:", error);
      throw error;
    }
  },

  // Update widget configuration
  updateWidgetConfig: async (config: any, userId?: string): Promise<void> => {
    try {
      const headers = await getAuthHeaders();
      const body = userId ? { ...config, userId } : config;
      const response = await fetch(`${API_BASE_URL}/widget/config`, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to update widget config: ${response.statusText}`
        );
      }
    } catch (error) {
      console.error("Error updating widget config:", error);
      throw error;
    }
  },

  // Create conversation from widget
  createConversation: async (
    widgetId: string,
    customerData: {
      name: string;
      email: string;
      phone?: string;
      message: string;
    }
  ): Promise<{ conversationId: number; success: boolean }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/widget/${widgetId}/conversation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(customerData),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to create conversation: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw error;
    }
  },

  // Send message from widget
  sendWidgetMessage: async (
    widgetId: string,
    conversationId: number,
    message: string
  ): Promise<Message> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/widget/${widgetId}/conversation/${conversationId}/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: message,
            sender: "customer",
            timestamp: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to send widget message: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error sending widget message:", error);
      throw error;
    }
  },

  // Get widget public data (for rendering widget)
  getWidgetPublicData: async (
    widgetId: string
  ): Promise<{
    companyName: string;
    welcomeMessage: string;
    primaryColor: string;
    textColor: string;
  }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/widget/${widgetId}/public`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch widget public data: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching widget public data:", error);
      throw error;
    }
  },

  // Update business information from Google Places
  updateBusinessInfo: async (
    businessInfo: any,
    userId?: string
  ): Promise<any> => {
    try {
      console.log("Updating business info:", { businessInfo, userId });
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/widget/business-info`, {
        method: "POST",
        headers,
        body: JSON.stringify({ businessInfo, userId }),
      });

      const responseData = await response.json();
      console.log("Business info update response:", responseData);

      if (!response.ok) {
        throw new Error(
          responseData.error ||
            `Failed to update business info: ${response.statusText}`
        );
      }

      return responseData;
    } catch (error) {
      console.error("Error updating business info:", error);
      throw error;
    }
  },

  // Get business information
  getBusinessInfo: async (userId?: string): Promise<any> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/widget/business-info/${userId}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch business info: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching business info:", error);
      throw error;
    }
  },
};

// AI API
export const aiAPI = {
  generateBulkMessage: async (
    businessInfo: any,
    title: string
  ): Promise<string> => {
    try {
      const response = await fetch("/api/generate-bulk-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessInfo,
          title,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to generate AI message: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error("Error generating AI message:", error);
      throw error;
    }
  },
};

// Payment API
export interface PaymentData {
  conversationId: string;
  amount: number;
  currency: string;
  description: string;
  customerEmail: string;
  dueDate?: string;
  lineItems?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentUrl: string;
  paymentLink?: string;
  description: string;
  customerEmail: string;
  conversationId: string;
  invoiceNumber?: string;
  dueDate?: string;
}

export const paymentAPI = {
  // Create a new payment
  createPayment: async (paymentData: PaymentData): Promise<Payment> => {
    try {
      console.log("🔄 Creating payment with data:", paymentData);
      const headers = await getAuthHeaders();
      console.log("🔐 Auth headers:", headers);

      const response = await fetch(`${API_BASE_URL}/payments`, {
        method: "POST",
        headers,
        body: JSON.stringify(paymentData),
      });

      console.log(
        "📡 Payment API response status:",
        response.status,
        response.statusText
      );

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.log("❌ Payment API error data:", errorData);
        } catch (parseError) {
          console.log("❌ Failed to parse error response:", parseError);
          errorData = {
            error: `HTTP ${response.status}: ${response.statusText}`,
          };
        }

        throw new Error(
          errorData.error || `Failed to create payment: ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log("✅ Payment created successfully:", result);
      return result;
    } catch (error) {
      console.error("💥 Error creating payment:", error);
      // Log the full error details
      if (error instanceof TypeError && error.message.includes("fetch")) {
        console.error(
          "🌐 Network error - check if backend is running at:",
          API_BASE_URL
        );
      }
      throw error;
    }
  },

  // Get payment details
  getPayment: async (paymentId: string): Promise<Payment> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to get payment: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting payment:", error);
      throw error;
    }
  },

  // Get all payments
  getAllPayments: async (): Promise<Payment[]> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/payments`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to get payments: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting payments:", error);
      throw error;
    }
  },

  // Get payments for a specific conversation
  getConversationPayments: async (
    conversationId: string
  ): Promise<Payment[]> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/payments/conversation/${conversationId}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to get conversation payments: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting conversation payments:", error);
      throw error;
    }
  },
};

// Customer and Activity API functions
export const customerAPI = {
  // Get customer details by conversation ID
  getCustomerByConversation: async (
    conversationId: string
  ): Promise<{
    success: boolean;
    data?: {
      id?: string;
      name: string;
      phone: string;
      email: string;
      status?: string;
    };
    message?: string;
  }> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/customers/conversation/${conversationId}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        return {
          success: false,
          message: `Failed to fetch customer: ${response.statusText}`,
        };
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching customer:", error);
      return {
        success: false,
        message: "Network error occurred",
      };
    }
  },

  // Get customer activities (payments, calls, etc.)
  getCustomerActivities: async (
    customerId: string,
    conversationId?: string
  ): Promise<{
    success: boolean;
    data?: {
      id: string;
      type: "payment" | "call" | "message";
      title: string;
      timestamp: string;
      amount?: number;
      duration?: number;
    }[];
    message?: string;
  }> => {
    try {
      const headers = await getAuthHeaders();
      const url = new URL(`${API_BASE_URL}/customers/${customerId}/activities`);

      // Add conversationId as query parameter if provided
      if (conversationId) {
        url.searchParams.append("conversationId", conversationId);
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        return {
          success: false,
          message: `Failed to fetch activities: ${response.statusText}`,
        };
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching activities:", error);
      return {
        success: false,
        message: "Network error occurred",
      };
    }
  },

  // Update customer status
  updateCustomerStatus: async (
    conversationId: string,
    status: string
  ): Promise<{
    success: boolean;
    data?: {
      status: string;
      statusColor?: string;
    };
    message?: string;
  }> => {
    try {
      console.log("🔄 Updating customer status:", { conversationId, status });
      console.log("🌐 API_BASE_URL:", API_BASE_URL);

      const headers = await getAuthHeaders();
      console.log("🔐 Auth headers:", headers);
      console.log(
        "🔑 Has Authorization header:",
        headers.Authorization ? "YES" : "NO"
      );

      const url = `${API_BASE_URL}/conversations/${conversationId}/status`;
      console.log("📡 Request URL:", url);

      const payload = { status };
      console.log("📦 Request payload:", payload);

      const response = await fetch(url, {
        method: "PATCH",
        headers,
        body: JSON.stringify(payload),
      });

      console.log("📡 Response status:", response.status, response.statusText);

      if (!response.ok) {
        let errorText = "";
        try {
          errorText = await response.text();
          console.log("❌ Error response text:", errorText);
        } catch (e) {
          console.log("❌ Could not read error response text");
        }

        // Handle specific authentication error
        if (response.status === 302 || response.status === 401) {
          return {
            success: false,
            message: `Authentication failed. Please refresh the page and try again. Status: ${response.status}`,
          };
        }

        return {
          success: false,
          message: `Failed to update status: ${response.statusText} - ${errorText}`,
        };
      }

      const data = await response.json();
      console.log("✅ Success response data:", data);
      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      console.error("💥 Error updating customer status:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
      return {
        success: false,
        message: "Network error occurred",
      };
    }
  },
};

// Bulk Message Types
export interface BulkMessage {
  _id: string;
  userId: string;
  title: string;
  message: string;
  recipients: BulkMessageRecipient[];
  status: "pending" | "in_progress" | "completed" | "failed" | "scheduled";
  scheduledDate: string;
  sentCount: number;
  failedCount: number;
  totalCount: number;
  isAIGenerated: boolean;
  aiPrompt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BulkMessageRecipient {
  conversationId: string;
  phone: string;
  customerName: string;
  status: "pending" | "sent" | "failed";
  sentAt?: string;
  error?: string;
}

export interface CreateBulkMessageData {
  title: string;
  message: string;
  recipients: string[]; // Array of conversation IDs or 'all'
  scheduledDate?: string;
  isAIGenerated?: boolean;
  aiPrompt?: string;
}

export interface BulkMessageResponse {
  success: boolean;
  data: BulkMessage[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Bulk Message API Functions
export const bulkMessageAPI = {
  // Generate AI message
  generateAIMessage: async (
    prompt: string,
    messageType: string = "promotional"
  ) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/bulk-messages/generate-ai`, {
      method: "POST",
      headers,
      body: JSON.stringify({ prompt, messageType }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Get recent bulk messages (top 5)
  getRecentBulkMessages: async (): Promise<BulkMessageResponse> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/bulk-messages/recent`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Get all bulk messages with pagination
  getAllBulkMessages: async (
    page: number = 1,
    limit: number = 10
  ): Promise<BulkMessageResponse> => {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/bulk-messages?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Create bulk message
  createBulkMessage: async (
    data: CreateBulkMessageData
  ): Promise<{ success: boolean; data: BulkMessage }> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/bulk-messages`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Get bulk message by ID
  getBulkMessageById: async (
    id: string
  ): Promise<{ success: boolean; data: BulkMessage }> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/bulk-messages/${id}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Delete bulk message
  deleteBulkMessage: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/bulk-messages/${id}`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};

// Voice Call Types
export interface Call {
  _id: string;
  conversationId: string;
  customerId?: string;
  userId: string;
  from: string;
  to: string;
  status:
    | "initiated"
    | "ringing"
    | "in-progress"
    | "completed"
    | "busy"
    | "no-answer"
    | "failed"
    | "canceled";
  direction: "inbound" | "outbound";
  duration: number;
  startedAt: string;
  endedAt?: string;
  answeredAt?: string;
  twilioSid: string;
  recordingUrl?: string;
  recordingSid?: string;
  recordingDuration?: number;
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface InitiateCallRequest {
  conversationId?: string;
  to: string;
  from?: string;
}

export interface CallHistoryParams {
  conversationId?: string;
  customerId?: string;
  limit?: number;
}

// Voice Calling API
export const callAPI = {
  // Initiate an outbound call
  initiateCall: async (
    data: InitiateCallRequest
  ): Promise<{ success: boolean; call: Call; twilioSid: string }> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/voice/call`, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || `Failed to initiate call: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error initiating call:", error);
      throw error;
    }
  },

  // End an active call
  endCall: async (
    callId: string
  ): Promise<{ success: boolean; call: Call }> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/voice/call/${callId}/end`, {
        method: "POST",
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || `Failed to end call: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error ending call:", error);
      throw error;
    }
  },

  // Get call history
  getCallHistory: async (
    params?: CallHistoryParams
  ): Promise<{ success: boolean; calls: Call[] }> => {
    try {
      const headers = await getAuthHeaders();
      const queryParams = new URLSearchParams();

      if (params?.conversationId)
        queryParams.append("conversationId", params.conversationId);
      if (params?.customerId)
        queryParams.append("customerId", params.customerId);
      if (params?.limit) queryParams.append("limit", params.limit.toString());

      const response = await fetch(
        `${API_BASE_URL}/voice/history?${queryParams.toString()}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch call history: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching call history:", error);
      throw error;
    }
  },

  // Get specific call details
  getCall: async (
    callId: string
  ): Promise<{ success: boolean; call: Call }> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/voice/call/${callId}`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch call: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching call:", error);
      throw error;
    }
  },

  // Add notes to a call
  addCallNotes: async (
    callId: string,
    notes: string
  ): Promise<{ success: boolean; call: Call }> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/voice/call/${callId}/notes`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ notes }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to add notes: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error adding notes:", error);
      throw error;
    }
  },
};

/*
BACKEND EXPRESS.JS IMPLEMENTATION GUIDE:

Your Express.js backend should implement these endpoints:

1. GET /api/v1/conversations
   - Returns array of all conversations for the authenticated user
   - Should include: id, name, avatar, time, lastMessage, status, statusColor, unread, location
   - Example response: [{ id: 1, name: "John Doe", avatar: "JD", ... }]

2. GET /api/v1/conversations/:id
   - Returns full conversation data including all messages
   - Should include: conversation details + messages array
   - Example response: { id: 1, name: "John Doe", messages: [{ id: 1, sender: "customer", content: "Hello", ... }] }

3. POST /api/v1/conversations/:id/messages
   - Creates a new message in the conversation
   - Request body: { content: string, sender: "agent", timestamp: string }
   - Response: newly created message object

4. PATCH /api/v1/conversations/:id/read
   - Marks conversation as read (sets unread: false)
   - No request body needed
   - Response: success status

5. PATCH /api/v1/conversations/:id/status
   - Updates conversation status
   - Request body: { status: string }
   - Response: success status

Database Schema Suggestions:
- conversations table: id, customer_name, customer_avatar, status, last_message_time, unread, location, created_at, updated_at
- messages table: id, conversation_id, sender_type, content, timestamp, created_at
- Add proper indexes on conversation_id and timestamp for performance

Authentication:
- Add JWT token validation middleware to protect these routes
- Extract user ID from token to ensure users only see their conversations

WebSocket Integration (Optional):
- Implement Socket.io for real-time message updates
- Emit events when new messages are received/sent
- Listen for these events in the frontend for instant updates

Error Handling:
- Return appropriate HTTP status codes (404 for not found, 401 for unauthorized, etc.)
- Include error messages in JSON format: { error: "Message not found" }

WIDGET ENDPOINTS:

6. GET /api/v1/widget/config
   - Returns user's widget configuration and widget ID
   - Requires authentication
   - Response: { widgetId: "uuid", config: { companyName, welcomeMessage, primaryColor, etc. } }

7. POST /api/v1/widget/generate
   - Generates a new widget for the authenticated user (or returns existing one)
   - Creates unique widget ID if doesn't exist
   - Response: { widgetId: "uuid", embedCode: "<iframe src='...'></iframe>" }

8. PUT /api/v1/widget/config
   - Updates widget configuration
   - Request body: { companyName, welcomeMessage, primaryColor, etc. }

9. GET /api/v1/widget/:widgetId/public
   - Public endpoint (no auth required) to get widget display data
   - Returns: { companyName, welcomeMessage, primaryColor, isActive }

10. POST /api/v1/widget/:widgetId/conversation
    - Creates new conversation from widget
    - Request body: { name, email, phone, message }
    - Response: { conversationId: number, success: boolean }

11. POST /api/v1/widget/:widgetId/conversation/:conversationId/message
    - Sends message from widget to existing conversation
    - Request body: { content, sender: "customer", timestamp }
    - Response: newly created message object

Additional Database Tables:
- widgets table: id, user_id, widget_id (UUID), company_name, welcome_message, primary_color, is_active, created_at, updated_at
- Add widget_id column to conversations table to link conversations to specific widgets
*/
