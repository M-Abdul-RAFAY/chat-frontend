"use client";

import { useState, useRef, useEffect } from "react";
import {
  Phone,
  Video,
  MoreHorizontal,
  Send,
  Paperclip,
  Sparkles,
  RefreshCw,
  X,
  Smile,
  FileText,
  Image as ImageIcon,
  File,
  Check,
  DollarSign,
  ArrowLeft,
  MessageCircle,
  Clock,
  CheckCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { chatAPI, Conversation, Message } from "@/lib/api";
import { useUser } from "@clerk/nextjs";
import { useSocket } from "@/hooks/useSocket";
import { PaymentModal } from "./PaymentModal";

interface ChatInterfaceProps {
  conversationId: string;
  conversationData?: Conversation | null;
  onToggleProfile: () => void;
  profileVisible: boolean;
  maxSuggestions?: number;
  onBackToConversations?: () => void;
}

interface AISuggestion {
  id: string;
  text: string;
  type: "quick" | "detailed";
}

interface AttachedFile {
  file: File;
  preview?: string;
  type: "image" | "document" | "other";
}

// Common emojis for quick access
const COMMON_EMOJIS = [
  "😊",
  "😂",
  "❤️",
  "👍",
  "👎",
  "😢",
  "😮",
  "😡",
  "🤔",
  "👏",
  "🙏",
  "💯",
  "🔥",
  "⭐",
  "✅",
  "❌",
  "⚠️",
  "💡",
  "📝",
  "📞",
];

export default function ChatInterface({
  conversationId,
  conversationData,
  onToggleProfile,
  profileVisible,
  maxSuggestions = 2,
  onBackToConversations,
}: ChatInterfaceProps) {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const [loadingAI, setLoadingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);

  // Enhanced file and emoji states
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});

  // Message management states
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [autoAIResponse, setAutoAIResponse] = useState(false);
  // Add WhatsApp/SMS platform toggles
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(true); // Default to true as requested

  // Payment states
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const { user } = useUser();

  // Socket integration for real-time updates
  const {
    isConnected,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
  } = useSocket({
    onNewMessage: (message: any) => {
      console.log("Socket: New message received", {
        messageId: message._id || message.id,
        type: message.type,
        conversationId: message.conversationId,
        currentConversationId: conversationId,
        hasPaymentData: !!message.paymentData,
        paymentData: message.paymentData,
      });

      // Only add message if it's for the current conversation
      if (message.conversationId === conversationId) {
        setMessages((prev) => {
          // Check if message already exists by both id and _id to avoid duplicates
          const existingMessage = prev.find(
            (msg) =>
              msg.id === message.id ||
              msg.id === message._id ||
              (msg.content === message.content &&
                Math.abs(
                  new Date().getTime() - new Date(msg.timestamp || 0).getTime()
                ) < 5000)
          );

          if (existingMessage) {
            console.log(
              "Message already exists, skipping duplicate:",
              message.id || message._id
            );
            return prev;
          }

          // Normalize sender field - map "AI" to "agent" to avoid confusion
          let normalizedSender = message.sender;
          if (message.sender === "AI") {
            normalizedSender = "agent";
          }

          const newMessage: Message = {
            id: message._id || message.id || Math.random().toString(),
            sender: normalizedSender as "customer" | "agent" | "system",
            content: message.content,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            timestamp: message.createdAt || new Date().toISOString(),
            avatar: normalizedSender === "agent" ? "AG" : customerAvatar,
            type: message.type || "text",
            paymentData: message.paymentData,
            isPayment: message.type === "payment",
          };

          console.log("Adding new message to state:", newMessage);
          return [...prev, newMessage];
        });
      }
    },
    onConversationUpdated: (data: any) => {
      console.log("Socket: Conversation updated", data);
      // Handle conversation updates (for unread status, etc.)
      if (data.conversationId === conversationId && data.unread) {
        // You could show a notification or update UI here
        console.log(
          "New message received in conversation:",
          data.conversationId
        );
      }
    },
    onPaymentStatusUpdate: (data: any) => {
      console.log("Socket: Payment status update received", data);
      // Update payment status in existing messages
      if (data.paymentId) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (
              msg.paymentData &&
              msg.paymentData.paymentId === data.paymentId
            ) {
              return {
                ...msg,
                paymentData: {
                  ...msg.paymentData,
                  status: data.status,
                },
              };
            }
            return msg;
          })
        );

        // Show notification about payment status change
        if (data.status === "completed") {
          console.log(`💰 Payment completed: ${data.message}`);
          // You could add a toast notification here
        }
      }
    },
  });

  // Use conversation data if available, otherwise fallback to placeholder
  const customerName =
    conversationData?.name || conversation?.name || "Will Pantente";
  const customerAvatar =
    conversationData?.avatar || conversation?.avatar || "WP";
  const customerStatusColor =
    conversationData?.statusColor ||
    conversation?.statusColor ||
    "bg-gradient-to-br from-pink-500 to-rose-500";

  // Join conversation when component mounts or conversationId changes
  useEffect(() => {
    if (conversationId && isConnected) {
      joinConversation(conversationId);
      console.log(`Joined conversation: ${conversationId}`);

      return () => {
        leaveConversation(conversationId);
        console.log(`Left conversation: ${conversationId}`);
      };
    }
  }, [conversationId, isConnected, joinConversation, leaveConversation]);

  // Handle typing indicators
  useEffect(() => {
    let typingTimer: NodeJS.Timeout | undefined;

    const handleTypingStart = () => {
      if (conversationId && isConnected) {
        startTyping(conversationId);
      }
    };

    const handleTypingStop = () => {
      if (conversationId && isConnected) {
        stopTyping(conversationId);
      }
    };

    if (newMessage.trim()) {
      handleTypingStart();
      if (typingTimer) clearTimeout(typingTimer);
      typingTimer = setTimeout(handleTypingStop, 1000); // Stop typing after 1 second of inactivity
    } else {
      handleTypingStop();
    }

    return () => {
      if (typingTimer) clearTimeout(typingTimer);
      handleTypingStop();
    };
  }, [newMessage, conversationId, isConnected, startTyping, stopTyping]);

  // Auto-scroll to bottom when messages change or suggestions are shown
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    };

    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, showSuggestions]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(event.target as Node)
      ) {
        setShowMoreMenu(false);
      }
    };

    if (showEmojiPicker || showMoreMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showEmojiPicker, showMoreMenu]);

  // Auto-resize textarea
  const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  };

  useEffect(() => {
    if (inputRef.current) {
      adjustTextareaHeight(inputRef.current);
    }
  }, [newMessage]);

  useEffect(() => {
    const fetchConversation = async () => {
      if (!conversationId) return;

      try {
        setLoading(true);
        setError(null);
        const data = await chatAPI.getConversation(conversationId);
        setConversation(data);

        // Transform messages to match the expected format
        const transformedMessages = data.messages.map((msg: any) => ({
          id: msg._id || msg.id || Math.random().toString(),
          sender: msg.sender,
          content: msg.content,
          time: msg.createdAt
            ? new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : msg.time ||
              new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
          avatar:
            msg.avatar || (msg.sender === "agent" ? "AG" : customerAvatar),
          timestamp: msg.createdAt,
          type: msg.type || "text",
          paymentData: msg.paymentData,
          isPayment: msg.type === "payment" || msg.isPayment || false,
        }));

        setMessages(transformedMessages);
      } catch (err) {
        console.error("Error fetching conversation:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load conversation"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [conversationId, customerAvatar]);

  // Handle keyboard navigation for suggestions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showSuggestions || aiSuggestions.length === 0) return;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          setSelectedSuggestionIndex((prev) =>
            prev > 0 ? prev - 1 : aiSuggestions.length - 1
          );
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedSuggestionIndex((prev) =>
            prev < aiSuggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case "Tab":
        case "Enter":
          if (e.key === "Tab" || (e.key === "Enter" && e.ctrlKey)) {
            e.preventDefault();
            handleSuggestionSelect(aiSuggestions[selectedSuggestionIndex]);
          }
          break;
        case "Escape":
          setShowSuggestions(false);
          break;
      }
    };

    if (showSuggestions) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [showSuggestions, aiSuggestions, selectedSuggestionIndex]);

  const getFileType = (file: File): "image" | "document" | "other" => {
    if (file.type.startsWith("image/")) return "image";
    if (
      file.type.includes("pdf") ||
      file.type.includes("document") ||
      file.type.includes("text")
    )
      return "document";
    return "other";
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("handleSendMessage called", {
      newMessage: newMessage.trim(),
      attachedFiles: attachedFiles.length,
      conversationId,
    });

    if ((!newMessage.trim() && attachedFiles.length === 0) || !conversationId) {
      console.log("Message send blocked: empty message or no conversation");
      return;
    }

    try {
      setSending(true);
      console.log("Starting message send process...");

      // Handle file uploads if present
      let fileInfos: any[] = [];
      if (attachedFiles.length > 0) {
        console.log("Processing file attachments...");
        for (const attachedFile of attachedFiles) {
          const formData = new FormData();
          formData.append("file", attachedFile.file);

          try {
            setUploadProgress((prev) => ({
              ...prev,
              [attachedFile.file.name]: 0,
            }));

            const res = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });

            const fileInfo = await res.json();
            fileInfos.push({
              name: attachedFile.file.name,
              size: formatFileSize(attachedFile.file.size),
              type: attachedFile.type,
              ...fileInfo,
            });

            setUploadProgress((prev) => ({
              ...prev,
              [attachedFile.file.name]: 100,
            }));
          } catch (err) {
            console.error("File upload failed:", err);
            fileInfos.push({
              name: attachedFile.file.name,
              error: "Upload failed",
              type: attachedFile.type,
            });
          }
        }
      }

      // Create message content
      let messageContent = newMessage;
      if (fileInfos.length > 0) {
        const fileDescriptions = fileInfos
          .map((info) =>
            info.error
              ? `❌ ${info.name} (${info.error})`
              : `📎 ${info.name} (${info.size})`
          )
          .join("\n");
        messageContent = messageContent
          ? `${messageContent}\n\n${fileDescriptions}`
          : fileDescriptions;
      }

      // Send message via API
      console.log(
        "Sending message to conversation:",
        conversationId,
        "content:",
        messageContent
      );
      console.log("chatAPI.sendMessage function:", typeof chatAPI.sendMessage);

      const sentMessage = await chatAPI.sendMessage({
        conversationId: conversationId.toString(),
        content: messageContent,
        sender: "agent",
      });

      console.log("Message sent successfully:", sentMessage);

      // Immediately add the message to UI (don't wait for socket)
      const immediateMessage: Message = {
        id: sentMessage._id || sentMessage.id || Math.random().toString(),
        sender: "agent",
        content: messageContent,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        timestamp: new Date().toISOString(),
        avatar: "AG",
      };

      setMessages((prev) => {
        // Check if this message already exists to avoid duplicates
        const exists = prev.some(
          (msg) =>
            msg.content === messageContent &&
            msg.sender === "agent" &&
            Math.abs(
              new Date().getTime() - new Date(msg.timestamp || 0).getTime()
            ) < 5000
        );

        if (exists) {
          console.log("Message already exists in state, not adding duplicate");
          return prev;
        }

        return [...prev, immediateMessage];
      });

      // Clear the form
      setNewMessage("");
      setAttachedFiles([]);
      setUploadProgress({});
      setShowSuggestions(false);
      setShowEmojiPicker(false);

      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }

      // Mark conversation as read
      try {
        await chatAPI.markAsRead(conversationId.toString());
      } catch (markReadError) {
        console.warn("Failed to mark conversation as read:", markReadError);
      }

      // Auto AI response if enabled
      if (autoAIResponse && messageContent.trim()) {
        console.log("Auto AI response is enabled, generating response...");
        setTimeout(async () => {
          try {
            await handleAIGenerate();
          } catch (error) {
            console.error("Error generating auto AI response:", error);
          }
        }, 1000); // Delay for better UX
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Show error to user
      setError(
        error instanceof Error ? error.message : "Failed to send message"
      );
    } finally {
      setSending(false);
    }
  };

  const handleAIGenerate = async () => {
    setLoadingAI(true);
    setShowSuggestions(false);

    try {
      const lastCustomerMsg =
        [...messages].reverse().find((m) => m.sender === "customer")?.content ||
        "";
      const prompt =
        lastCustomerMsg || "Generate helpful customer support replies.";

      const res = await fetch("/api/generate-ai-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, maxSuggestions }),
      });

      const data = await res.json();

      if (data.message) {
        try {
          const suggestions = JSON.parse(data.message);
          if (Array.isArray(suggestions)) {
            const formattedSuggestions: AISuggestion[] = suggestions
              .slice(0, maxSuggestions)
              .map((suggestion, index) => ({
                id: `suggestion-${index}`,
                text: suggestion.text || suggestion,
                type: suggestion.type || "detailed",
              }));
            setAiSuggestions(formattedSuggestions);
            setSelectedSuggestionIndex(0);
            setShowSuggestions(true);
            inputRef.current?.focus();
          } else {
            createFallbackSuggestions(data.message);
          }
        } catch (parseError) {
          console.error("Error parsing AI response:", parseError);
          createFallbackSuggestions(data.message);
        }
      }
    } catch (err) {
      console.error("Error generating AI suggestions:", err);
      const fallbackSuggestions: AISuggestion[] = [
        {
          id: "1",
          text: "Thank you for reaching out!",
          type: "quick" as const,
        },
        {
          id: "2",
          text: "I'd be happy to help you with that.",
          type: "detailed" as const,
        },
      ].slice(0, maxSuggestions);

      setAiSuggestions(fallbackSuggestions);
      setSelectedSuggestionIndex(0);
      setShowSuggestions(true);
      inputRef.current?.focus();
    } finally {
      setLoadingAI(false);
    }
  };

  const createFallbackSuggestions = (aiResponse: string) => {
    const suggestions: AISuggestion[] = [
      { id: "1", text: "Thank you!", type: "quick" as const },
      { id: "2", text: aiResponse, type: "detailed" as const },
    ].slice(0, maxSuggestions);

    setAiSuggestions(suggestions);
    setSelectedSuggestionIndex(0);
    setShowSuggestions(true);
    inputRef.current?.focus();
  };

  const handleSuggestionSelect = (suggestion: AISuggestion) => {
    setNewMessage(suggestion.text);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    adjustTextareaHeight(e.target);
    if (showSuggestions && e.target.value !== "") {
      setShowSuggestions(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => {
        const attachedFile: AttachedFile = {
          file,
          type: getFileType(file),
        };

        // Create preview for images
        if (attachedFile.type === "image") {
          const reader = new FileReader();
          reader.onload = (e) => {
            setAttachedFiles((prev) =>
              prev.map((f) =>
                f.file.name === file.name
                  ? { ...f, preview: e.target?.result as string }
                  : f
              )
            );
          };
          reader.readAsDataURL(file);
        }

        return attachedFile;
      });

      setAttachedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (fileName: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.file.name !== fileName));
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
  };

  const handleEmojiSelect = (emoji: string) => {
    const cursorPosition =
      inputRef.current?.selectionStart || newMessage.length;
    const newText =
      newMessage.slice(0, cursorPosition) +
      emoji +
      newMessage.slice(cursorPosition);
    setNewMessage(newText);

    // Focus back to input and set cursor position
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(
          cursorPosition + emoji.length,
          cursorPosition + emoji.length
        );
        adjustTextareaHeight(inputRef.current);
      }
    }, 0);
  };

  const getFileIcon = (type: "image" | "document" | "other") => {
    switch (type) {
      case "image":
        return <ImageIcon className="w-4 h-4" />;
      case "document":
        return <FileText className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  // Fetch user settings on mount or user change
  useEffect(() => {
    const fetchUserSettings = async () => {
      if (!user?.id) return;

      try {
        console.log("Fetching user settings for user:", user.id);
        const response = await fetch(`/api/user-settings?userId=${user.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const settings = await response.json();
          console.log("User settings fetched:", settings);

          // Set the AI response toggle
          setAutoAIResponse(settings.aiGeneratedResponse || true);
          setWhatsappEnabled(settings.whatsapp || false);
          setSmsEnabled(settings.sms || true);
        } else {
          console.warn("Failed to fetch user settings, using defaults");
          // Use default values on error
          setAutoAIResponse(true);
          setWhatsappEnabled(false);
          setSmsEnabled(true);
        }
      } catch (error) {
        console.error("Error fetching user settings:", error);
        // Use default values on error
        setAutoAIResponse(true);
        setWhatsappEnabled(false);
        setSmsEnabled(true);
      }
    };

    fetchUserSettings();
  }, [user?.id]);

  // Save user settings helper
  const saveUserSettings = async (
    settingKey: string,
    value: boolean,
    extra?: { whatsapp?: boolean; sms?: boolean }
  ) => {
    if (!user?.id) return;

    // Always send the current state of all toggles for consistency
    const body = {
      userId: user.id,
      aiGeneratedResponse:
        settingKey === "aiGeneratedResponse" ? value : autoAIResponse,
      whatsapp:
        typeof extra?.whatsapp === "boolean" ? extra.whatsapp : whatsappEnabled,
      sms: typeof extra?.sms === "boolean" ? extra.sms : smsEnabled,
    };

    // If the change is for whatsapp or sms, update the value accordingly
    if (settingKey === "whatsapp") body.whatsapp = value;
    if (settingKey === "sms") body.sms = value;

    try {
      console.log("Saving user settings:", body);
      const response = await fetch(`/api/user-settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        console.log("User settings saved successfully");
      } else {
        console.error("Failed to save user settings:", response.statusText);
      }
    } catch (error) {
      console.error("Error saving user settings:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
          <p className="text-gray-600 font-medium">Loading conversation...</p>
          <p className="text-sm text-gray-400 mt-1">Please wait a moment</p>
          <div className="relative mt-4">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur-lg opacity-20 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full p-3 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 animate-spin text-white" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-red-100">
          <div className="bg-red-100 rounded-full p-3 w-fit mx-auto mb-4">
            <X className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-red-600 font-medium mb-2">{error}</p>
          <p className="text-sm text-gray-500">
            Please try refreshing the page
          </p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="bg-blue-100 rounded-full p-3 w-fit mx-auto mb-4">
            <MessageCircle className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No conversation selected
          </h3>
          <p className="text-gray-500">
            Select a conversation from the sidebar to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 flex-1 min-w-0 h-full relative">
      {/* Header - Enhanced with gradient and better styling */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3 min-w-0">
            {/* Back Button - Enhanced */}
            {onBackToConversations && (
              <button
                onClick={onBackToConversations}
                className="p-2 text-gray-500 hover:bg-white hover:text-gray-700 rounded-xl transition-all duration-200 md:hidden shadow-sm"
              >
                <ArrowLeft size={20} />
              </button>
            )}

            <div
              className="flex items-center space-x-3 min-w-0 cursor-pointer hover:bg-white/50 rounded-xl p-2 -m-2 transition-all duration-200 group"
              onClick={onToggleProfile}
            >
              <div className="relative">
                <div
                  className={`w-10 h-10 ${customerStatusColor} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 text-sm shadow-lg`}
                >
                  {customerAvatar}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-gray-900 truncate">
                  {customerName
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </h2>
                <p className="text-xs text-green-600 font-medium">Online</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 flex-shrink-0">
            <button className="p-2.5 text-gray-500 hover:bg-white hover:text-blue-600 rounded-xl transition-all duration-200 shadow-sm">
              <Phone size={20} />
            </button>
            <button className="p-2.5 text-gray-500 hover:bg-white hover:text-blue-600 rounded-xl transition-all duration-200 shadow-sm">
              <Video size={20} />
            </button>

            {/* More Options Menu - Enhanced */}
            <div className="relative" ref={moreMenuRef}>
              <button
                className="p-2.5 text-gray-500 hover:bg-white hover:text-gray-700 rounded-xl transition-all duration-200 shadow-sm"
                onClick={() => setShowMoreMenu(!showMoreMenu)}
              >
                <MoreHorizontal size={20} />
              </button>

              {showMoreMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl z-20 overflow-hidden">
                  {/* Auto AI Toggle */}
                  <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={autoAIResponse}
                          onChange={async (e) => {
                            setAutoAIResponse(e.target.checked);
                            await saveUserSettings(
                              "aiGeneratedResponse",
                              e.target.checked
                            );
                          }}
                          className="sr-only"
                        />
                        <div
                          className={cn(
                            "w-10 h-5 rounded-full transition-colors duration-200 pt-[1px] flex items-center",
                            autoAIResponse ? "bg-blue-500" : "bg-gray-300"
                          )}
                        >
                          <div
                            className={cn(
                              "w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ",
                              autoAIResponse ? "translate-x-5" : "translate-x-0"
                            )}
                          />
                        </div>
                      </div>

                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Auto AI Response
                        </span>
                        <p className="text-xs text-gray-500">
                          Generate suggestions automatically
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Platform Options */}
                  <div className="px-4 py-3">
                    <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">
                      Send via Platform
                    </p>
                    <div className="space-y-2">
                      <button
                        onClick={async () => {
                          setWhatsappEnabled(true);
                          setSmsEnabled(false);
                          await saveUserSettings("whatsapp", true, {
                            whatsapp: true,
                            sms: false,
                          });
                        }}
                        className="w-full px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-green-50 rounded-xl transition-colors duration-200 flex items-center justify-between group"
                      >
                        <span className="flex items-center space-x-3">
                          <span className="text-lg">📱</span>
                          <span className="font-medium">WhatsApp</span>
                        </span>
                        {whatsappEnabled && (
                          <div className="bg-green-500 rounded-full p-1">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                      <button
                        onClick={async () => {
                          setWhatsappEnabled(false);
                          setSmsEnabled(true);
                          await saveUserSettings("sms", true, {
                            whatsapp: false,
                            sms: true,
                          });
                        }}
                        className="w-full px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 rounded-xl transition-colors duration-200 flex items-center justify-between group"
                      >
                        <span className="flex items-center space-x-3">
                          <span className="text-lg">💬</span>
                          <span className="font-medium">SMS</span>
                        </span>
                        {smsEnabled && (
                          <div className="bg-blue-500 rounded-full p-1">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages - Enhanced with better styling */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
      >
        {messages.length > 0 && (
          <div className="text-center mb-6">
            <div className="inline-flex items-center space-x-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-200/50">
              <Clock className="w-4 h-4 text-gray-400" />
              <p className="text-sm text-gray-600 font-medium">
                Conversation with {customerName}
              </p>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Started{" "}
              {(() => {
                const firstMessage = messages[0];
                if (firstMessage?.timestamp) {
                  try {
                    const date = new Date(firstMessage.timestamp);
                    const today = new Date();
                    const isToday =
                      date.toDateString() === today.toDateString();

                    if (isToday) {
                      return `today at ${date.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`;
                    } else {
                      return `on ${date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })} at ${date.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`;
                    }
                  } catch (error) {
                    return "recently";
                  }
                }
                return "recently";
              })()}
            </p>
          </div>
        )}

        {messages.map((message, index) => {
          const isCustomer = message.sender === "customer";
          const isAgent = ["agent", "AI", "system"].includes(message.sender);

          return (
            <div
              key={`${message.id}-${index}`}
              className={cn(
                "flex items-start group animate-in slide-in-from-bottom-2 duration-300",
                isAgent ? "flex-row-reverse" : ""
              )}
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0 shadow-lg",
                  isCustomer
                    ? customerStatusColor
                    : "bg-gradient-to-br from-blue-500 to-indigo-600"
                )}
              >
                {message.avatar}
              </div>

              <div
                className={cn(
                  "flex items-start min-w-0 max-w-xs lg:max-w-md",
                  isAgent ? "mr-3" : "ml-3"
                )}
              >
                <div
                  className={cn(
                    "px-4 py-3 rounded-2xl text-sm relative shadow-sm border",
                    message.type === "payment"
                      ? "bg-gradient-to-br from-green-50 to-emerald-50 text-green-900 border-green-200"
                      : isCustomer
                      ? "bg-white text-gray-900 border-gray-200"
                      : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-blue-300",
                    isAgent ? "rounded-tr-md" : "rounded-tl-md"
                  )}
                >
                  {message.type === "payment" && message.paymentData ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-green-500 rounded-full p-1">
                          <DollarSign className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-green-800">
                          Payment Invoice Created
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-green-700">Amount:</span>
                          <span className="font-semibold">
                            ${message.paymentData.amount}{" "}
                            {message.paymentData.currency.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <span className="text-green-700">Description:</span>
                          <p className="mt-1">
                            {message.paymentData.description}
                          </p>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">Invoice #:</span>
                          <span className="font-mono text-xs">
                            {message.paymentData.invoiceNumber}
                          </span>
                        </div>
                        {message.paymentData.dueDate && (
                          <div className="flex justify-between">
                            <span className="text-green-700">Due Date:</span>
                            <span>
                              {new Date(
                                message.paymentData.dueDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-green-700">Status:</span>
                          <span
                            className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium capitalize",
                              message.paymentData.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            )}
                          >
                            {message.paymentData.status}
                          </span>
                        </div>
                      </div>
                      {message.paymentData.paymentUrl && (
                        <div className="pt-2 border-t border-green-200">
                          <a
                            href={message.paymentData.paymentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-full px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors duration-200 shadow-sm"
                          >
                            <DollarSign className="w-4 h-4 mr-2" />
                            Pay Invoice
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap break-words leading-relaxed">
                      {message.content}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2 pt-1">
                    <p
                      className={cn(
                        "text-xs flex items-center space-x-1",
                        isCustomer ? "text-gray-500" : "text-gray-400"
                      )}
                    >
                      <Clock className="w-3 h-3" />
                      <span>{message.time}</span>
                    </p>
                    {isAgent && (
                      <CheckCheck className="w-4 h-4 text-blue-200" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - Enhanced with modern styling */}
      <div className="px-4 py-4 bg-white/80 backdrop-blur-sm border-t border-gray-200/50 sticky bottom-0 left-0 right-0 z-10">
        {/* AI Suggestions Bar - Enhanced */}
        {showSuggestions && aiSuggestions.length > 0 && (
          <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 border border-purple-200/50 rounded-2xl shadow-sm backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-full p-1.5">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  AI Suggested Responses
                </span>
              </div>
              <button
                onClick={() => setShowSuggestions(false)}
                className="p-1 hover:bg-white/50 rounded-full transition-colors duration-200"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="space-y-2">
              {aiSuggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 border group hover:shadow-md",
                    index === selectedSuggestionIndex
                      ? "bg-white border-purple-300 shadow-md ring-2 ring-purple-100"
                      : "bg-white/70 border-transparent hover:bg-white hover:border-purple-200"
                  )}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full flex-shrink-0 mt-2 transition-colors",
                        index === selectedSuggestionIndex
                          ? "bg-purple-500"
                          : "bg-gray-300 group-hover:bg-purple-400"
                      )}
                    />
                    <span className="flex-1 text-gray-800 leading-relaxed">
                      {suggestion.text}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Attached Files Preview - Enhanced */}
        {attachedFiles.length > 0 && (
          <div className="mb-4 p-4 bg-gray-50/80 backdrop-blur-sm rounded-2xl border border-gray-200/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                <Paperclip className="w-4 h-4" />
                <span>Attached Files ({attachedFiles.length})</span>
              </span>
            </div>
            <div className="space-y-2">
              {attachedFiles.map((attachedFile, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-gray-200 shadow-sm"
                >
                  <div className="flex-shrink-0 text-gray-500 bg-gray-100 rounded-lg p-2">
                    {getFileIcon(attachedFile.type)}
                  </div>

                  {attachedFile.preview && (
                    <img
                      src={attachedFile.preview}
                      alt="Preview"
                      className="w-10 h-10 object-cover rounded-lg shadow-sm"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {attachedFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(attachedFile.file.size)}
                    </p>

                    {uploadProgress[attachedFile.file.name] !== undefined &&
                      uploadProgress[attachedFile.file.name] < 100 && (
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1.5 rounded-full transition-all duration-300"
                            style={{
                              width: `${
                                uploadProgress[attachedFile.file.name]
                              }%`,
                            }}
                          />
                        </div>
                      )}
                  </div>

                  <button
                    onClick={() => removeFile(attachedFile.file.name)}
                    className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Emoji Picker - Enhanced */}
        {showEmojiPicker && (
          <div
            ref={emojiPickerRef}
            className="mb-4 p-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                <Smile className="w-4 h-4" />
                <span>Quick Emojis</span>
              </span>
              <button
                onClick={() => setShowEmojiPicker(false)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-10 gap-2">
              {COMMON_EMOJIS.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleEmojiSelect(emoji)}
                  className="p-2 text-xl hover:bg-gray-100 rounded-lg transition-colors duration-200 hover:scale-110 transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        <form
          onSubmit={(e) => {
            console.log("Form onSubmit triggered");
            handleSendMessage(e);
          }}
          className="flex items-end space-x-3"
        >
          {/* Action Buttons */}
          <div className="flex items-center space-x-1">
            <button
              type="button"
              className="p-3 text-gray-500 hover:bg-white hover:text-blue-600 rounded-xl transition-all duration-200 shadow-sm"
              onClick={handleAttachClick}
              title="Attach file"
            >
              <Paperclip size={20} />
            </button>

            <button
              type="button"
              className="p-3 text-gray-500 hover:bg-white hover:text-yellow-600 rounded-xl transition-all duration-200 shadow-sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              title="Add emoji"
            >
              <Smile size={20} />
            </button>

            <button
              type="button"
              className="p-3 text-green-600 hover:bg-white hover:text-green-700 rounded-xl transition-all duration-200 shadow-sm"
              onClick={() => setShowPaymentModal(true)}
              title="Request Payment"
            >
              <DollarSign size={20} />
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx"
          />

          {/* Message Input */}
          <div className="flex-1">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={newMessage}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                placeholder="Type your message..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none min-h-[3rem] max-h-[8rem] bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-200"
                rows={1}
              />

              {/* AI Generate Button - Inside input */}
              <button
                type="button"
                onClick={handleAIGenerate}
                className={cn(
                  "absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all duration-200",
                  loadingAI
                    ? "text-purple-400 cursor-not-allowed"
                    : "text-purple-600 hover:bg-purple-50"
                )}
                title="Generate AI suggestions"
                disabled={loadingAI}
              >
                {loadingAI ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles size={16} />
                )}
              </button>
            </div>
          </div>

          {/* Send Button - Enhanced */}
          <button
            type="submit"
            onClick={(e) => {
              console.log("Send button clicked");
              if (e.type === "click") {
                handleSendMessage(e);
              }
            }}
            disabled={
              (!newMessage.trim() && attachedFiles.length === 0) ||
              sending ||
              !conversationId
            }
            className={cn(
              "p-3 rounded-xl transition-all duration-200 shadow-sm transform hover:scale-105",
              (newMessage.trim() || attachedFiles.length > 0) &&
                !sending &&
                conversationId
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            )}
          >
            {sending ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </form>
      </div>

      {/* Payment Modal - Properly positioned */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        conversationId={conversationId}
        customerEmail=""
        onPaymentCreated={async (payment) => {
          console.log("Payment created:", payment);
          setShowPaymentModal(false);

          setTimeout(async () => {
            try {
              console.log("Refreshing conversation after payment creation...");
              const data = await chatAPI.getConversation(conversationId);

              const transformedMessages = data.messages.map((msg: any) => ({
                id: msg._id || msg.id || Math.random().toString(),
                sender: msg.sender,
                content: msg.content,
                time: msg.createdAt
                  ? new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : msg.time ||
                    new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                avatar:
                  msg.avatar ||
                  (msg.sender === "agent" ? "AG" : customerAvatar),
                timestamp: msg.createdAt,
                type: msg.type || "text",
                paymentData: msg.paymentData,
                isPayment: msg.type === "payment" || msg.isPayment || false,
              }));

              setMessages(transformedMessages);
              console.log("Conversation refreshed successfully");
            } catch (error) {
              console.error("Error refreshing conversation:", error);
            }
          }, 1000);
        }}
      />
    </div>
  );
}
