// API configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// Helper function to get auth headers (client-side)
const getAuthHeaders = async () => {
  try {
    // For client-side, we need to use window.Clerk
    if (typeof window !== "undefined" && (window as any).Clerk) {
      const session = (window as any).Clerk.session;
      if (session) {
        const token = await session.getToken();
        if (token) {
          return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          };
        }
      }
    }

    // If no token available, still return headers but without auth
    console.warn("No Clerk token available - user may not be authenticated");
    return {
      "Content-Type": "application/json",
    };
  } catch (error) {
    console.error("Error getting auth token:", error);
    return {
      "Content-Type": "application/json",
    };
  }
};

// Types for API responses
export interface Conversation {
  id: number;
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
  id: number;
  sender: "customer" | "agent" | "system";
  content: string;
  time: string;
  isSystem?: boolean;
  avatar?: string;
}

export interface SendMessageRequest {
  conversationId: number;
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
  getConversation: async (conversationId: number): Promise<Conversation> => {
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
  markAsRead: async (conversationId: number): Promise<void> => {
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
    conversationId: number,
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
};

// Widget API functions
export const widgetAPI = {
  // Get user's widget configuration
  getWidgetConfig: async (): Promise<{ widgetId: string; config: any }> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/widget/config`, {
        method: "GET",
        headers,
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
  generateWidget: async (): Promise<{
    widgetId: string;
    embedCode: string;
  }> => {
    try {
      const headers = await getAuthHeaders();
      console.log(headers);
      const response = await fetch(`${API_BASE_URL}/widget/generate`, {
        method: "POST",
        headers,
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
  updateWidgetConfig: async (config: any): Promise<void> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/widget/config`, {
        method: "PUT",
        headers,
        body: JSON.stringify(config),
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
