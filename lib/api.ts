import { use } from "react";

// API configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000/api/v1";

// Helper function to get auth headers (client-side)
export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  try {
    // Check if we're on the client side
    if (typeof window !== "undefined") {
      // Try to get token from Clerk
      if ((window as any).Clerk && (window as any).Clerk.session) {
        const token = await (window as any).Clerk.session.getToken();
        console.log("Got Clerk token:", token ? "YES" : "NO");
        if (token) {
          return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          };
        }
      }
    }
    
    console.log("No Clerk token available - using fallback");
    // If no token, return headers without Authorization
    return {
      "Content-Type": "application/json",
    };
  } catch (error) {
    console.error("Error getting auth headers:", error);
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
  name: string;
  avatar: string;
  time: string;
  lastMessage: string;
  status: string;
  statusColor: string;
  unread: boolean;
  location: string;
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

      return await response.json();
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
        method: "GET",
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
    isActive: boolean;
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
};

// Payment API functions
export const paymentAPI = {
  // Create a payment link
  createPayment: async (paymentData: {
    conversationId: string;
    amount: number;
    currency?: string;
    description: string;
    customerEmail: string;
    dueDate?: string;
    lineItems?: Array<{
      description: string;
      quantity?: number;
      unitPrice: number;
    }>;
  }): Promise<any> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/payments`, {
        method: "POST",
        headers,
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create payment: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating payment:", error);
      throw error;
    }
  },

  // Get all payments for user
  getPayments: async (filters?: {
    status?: string;
    customerId?: string;
    conversationId?: string;
  }): Promise<any> => {
    try {
      const headers = await getAuthHeaders();
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });
      }

      const response = await fetch(`${API_BASE_URL}/payments?${queryParams}`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch payments: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching payments:", error);
      throw error;
    }
  },

  // Get specific payment
  getPayment: async (paymentId: string): Promise<any> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch payment: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching payment:", error);
      throw error;
    }
  },

  // Get payments for a conversation
  getConversationPayments: async (conversationId: string): Promise<any> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/payments/conversation/${conversationId}`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch conversation payments: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching conversation payments:", error);
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
