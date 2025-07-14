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
  MapPin,
  DollarSign,
  ArrowLeft,
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
  const customerLocation =
    conversationData?.location || conversation?.location || "Venture Auto ...";
  const customerAvatar =
    conversationData?.avatar || conversation?.avatar || "WP";
  const customerStatusColor =
    conversationData?.statusColor || conversation?.statusColor || "bg-pink-500";

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
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
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
    <div className="flex flex-col bg-white flex-1 min-w-0 h-full relative">
      {/* Header - Fixed */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center space-x-2 min-w-0">
          {/* Back Button - Show only on small screens */}
          {onBackToConversations && (
            <button
              onClick={onBackToConversations}
              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          <div
            className="flex items-center space-x-2 min-w-0 cursor-pointer hover:bg-gray-50 rounded-lg p-1 -m-1 transition-colors"
            onClick={onToggleProfile}
          >
            <div
              className={`w-8 h-8 ${customerStatusColor} rounded-full flex items-center justify-center text-white font-medium flex-shrink-0 text-xs`}
            >
              {customerAvatar}
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-gray-900 truncate text-sm">
                {customerName
                  .split(" ")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </h2>
              <p className="text-xs text-gray-500 flex items-center">
                <MapPin size={12} />
                <span className="truncate">{customerLocation}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1 flex-shrink-0">
          <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
            <Phone size={18} />
          </button>
          <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
            <Video size={18} />
          </button>

          {/* More Options Menu */}
          <div className="relative" ref={moreMenuRef}>
            <button
              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
            >
              <MoreHorizontal size={18} />
            </button>

            {/* --- REPLACED SECTION START --- */}
            {showMoreMenu && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                {/* Auto AI Toggle */}
                <div className="px-4 py-2 border-b border-gray-100">
                  <label className="flex items-center space-x-2 cursor-pointer">
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
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Auto AI Response
                    </span>
                  </label>
                </div>

                {/* Platform Options */}
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">
                    Send via Platform:
                  </p>
                  <button
                    onClick={async () => {
                      setWhatsappEnabled(true);
                      setSmsEnabled(false);
                      await saveUserSettings("whatsapp", true, {
                        whatsapp: true,
                        sms: false,
                      });
                    }}
                    className="w-full px-2 py-1 text-left text-sm text-gray-700 hover:bg-gray-50 rounded mb-1 flex items-center justify-between"
                  >
                    <span className="flex items-center space-x-2">
                      <span>📱</span>
                      <span>WhatsApp</span>
                    </span>
                    {whatsappEnabled && (
                      <Check className="w-4 h-4 text-green-600" />
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
                    className="w-full px-2 py-1 text-left text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center justify-between"
                  >
                    <span className="flex items-center space-x-2">
                      <span>💬</span>
                      <span>SMS</span>
                    </span>
                    {smsEnabled && <Check className="w-4 h-4 text-green-600" />}
                  </button>
                </div>
              </div>
            )}
            {/* --- REPLACED SECTION END --- */}
          </div>
        </div>
      </div>

      {/* Messages - Scrollable placeholder*/}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-2 py-2 space-y-3"
      >
        {messages.length > 0 && (
          <div className="text-center">
            <p className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block">
              Conversation with {customerName}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Started {(() => {
                // Use the first message's timestamp if available, otherwise fallback
                const firstMessage = messages[0];
                if (firstMessage?.timestamp) {
                  try {
                    const date = new Date(firstMessage.timestamp);
                    const today = new Date();
                    const isToday = date.toDateString() === today.toDateString();
                    
                    if (isToday) {
                      return `today at ${date.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}`;
                    } else {
                      return `on ${date.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })} at ${date.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}`;
                    }
                  } catch (error) {
                    return 'recently';
                  }
                }
                return 'recently';
              })()}
            </p>
          </div>
        )}

        {messages.map((message, index) => {
          // Determine if message is from customer (left side) or agent/ai/system (right side)
          const isCustomer = message.sender === "customer";
          const isAgent = ["agent", "AI", "system"].includes(message.sender);

          return (
            <div
              key={`${message.id}-${index}`}
              className={cn(
                "flex items-start group",
                isAgent ? "flex-row-reverse" : ""
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-white flex-shrink-0",
                  isCustomer ? customerStatusColor : "bg-blue-500"
                )}
              >
                {message.avatar}
              </div>

              <div
                className={cn(
                  "flex items-start min-w-0",
                  isAgent ? "mr-2" : "ml-2"
                )}
              >
                <div
                  className={cn(
                    "flex items-start",
                    isAgent
                      ? "flex-row-reverse space-x-reverse space-x-2"
                      : "space-x-2"
                  )}
                >
                  <div
                    className={cn(
                      "px-3 py-1.5 rounded-2xl text-xs relative inline-block max-w-xs lg:max-w-md",
                      message.type === "payment"
                        ? "bg-green-100 text-green-900 border border-green-200"
                        : isCustomer
                        ? "bg-gray-100 text-gray-900"
                        : "bg-blue-500 text-white"
                    )}
                  >
                    {message.type === "payment" && message.paymentData ? (
                      <div className="text-xs">
                        <div className="flex items-center gap-2 mb-2">
                          <span>💳</span>
                          <span className="font-semibold">
                            Payment Invoice Created
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p>
                            <span className="font-medium">Amount:</span> $
                            {message.paymentData.amount}{" "}
                            {message.paymentData.currency.toUpperCase()}
                          </p>
                          <p>
                            <span className="font-medium">Description:</span>{" "}
                            {message.paymentData.description}
                          </p>
                          <p>
                            <span className="font-medium">Invoice #:</span>{" "}
                            {message.paymentData.invoiceNumber}
                          </p>
                          {message.paymentData.dueDate && (
                            <p>
                              <span className="font-medium">Due Date:</span>{" "}
                              {new Date(
                                message.paymentData.dueDate
                              ).toLocaleDateString()}
                            </p>
                          )}
                          <p>
                            <span className="font-medium">Status:</span>{" "}
                            <span className="capitalize">
                              {message.paymentData.status}
                            </span>
                          </p>
                        </div>
                        {message.paymentData.paymentUrl && (
                          <div className="mt-3">
                            <a
                              href={message.paymentData.paymentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cn(
                                "inline-block px-3 py-1.5 rounded-lg text-xs font-medium text-center min-w-[100px] transition-colors",
                                message.type === "payment"
                                  ? "bg-green-600 text-white hover:bg-green-700"
                                  : isCustomer
                                  ? "bg-blue-500 text-white hover:bg-blue-600"
                                  : "bg-white text-blue-500 hover:bg-gray-50"
                              )}
                            >
                              Pay Invoice
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-0.5">
                      <p
                        className={cn(
                          "text-[10px]",
                          isCustomer ? "text-gray-500" : "text-blue-100"
                        )}
                      >
                        {message.time}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - Fixed */}
      <div className="px-2 py-2 border-t border-gray-200 bg-white sticky bottom-0 left-0 right-0 z-10">
        {/* AI Suggestions Bar - Above Input - More Compact */}
        {showSuggestions && aiSuggestions.length > 0 && (
          <div className="mb-2 p-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="p-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-800">
                  Suggested responses
                </span>
              </div>
              <button
                onClick={() => setShowSuggestions(false)}
                className="p-0.5 hover:bg-white hover:bg-opacity-50 rounded-full transition-colors"
              >
                <X className="w-3 h-3 text-gray-600" />
              </button>
            </div>
            <div className="space-y-1.5">
              {aiSuggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-xs transition-all duration-200 border group hover:shadow-sm",
                    index === selectedSuggestionIndex
                      ? "bg-white border-blue-300 shadow-sm"
                      : "bg-white bg-opacity-70 border-transparent hover:bg-white hover:border-blue-200"
                  )}
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className={cn(
                        "w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors",
                        index === selectedSuggestionIndex
                          ? "bg-blue-500"
                          : "bg-gray-300 group-hover:bg-blue-400"
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

        {/* Attached Files Preview */}
        {attachedFiles.length > 0 && (
          <div className="mb-2 p-2 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700">
                Attached Files ({attachedFiles.length})
              </span>
            </div>
            <div className="space-y-2">
              {attachedFiles.map((attachedFile, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-2 bg-white rounded border"
                >
                  <div className="flex-shrink-0 text-gray-500">
                    {getFileIcon(attachedFile.type)}
                  </div>

                  {attachedFile.preview && (
                    <img
                      src={attachedFile.preview}
                      alt="Preview"
                      className="w-8 h-8 object-cover rounded"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {attachedFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(attachedFile.file.size)}
                    </p>

                    {uploadProgress[attachedFile.file.name] !== undefined &&
                      uploadProgress[attachedFile.file.name] < 100 && (
                        <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                          <div
                            className="bg-blue-500 h-1 rounded-full transition-all duration-300"
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
                    className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div
            ref={emojiPickerRef}
            className="mb-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700">
                Quick Emojis
              </span>
              <button
                onClick={() => setShowEmojiPicker(false)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-10 gap-1">
              {COMMON_EMOJIS.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleEmojiSelect(emoji)}
                  className="p-1 text-lg hover:bg-gray-100 rounded transition-colors"
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
          className="flex items-end space-x-2"
        >
          <button
            type="button"
            className="p-2 mb-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            onClick={handleAttachClick}
          >
            <Paperclip size={18} />
          </button>

          <button
            type="button"
            className="p-2 mb-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile size={18} />
          </button>

          <button
            type="button"
            className="p-2 mb-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors flex-shrink-0"
            onClick={() => setShowPaymentModal(true)}
            title="Request Payment"
          >
            <DollarSign size={18} />
          </button>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx"
          />

          <div className="flex-1 mt-2">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              placeholder="Type a message..."
              className="w-full px-3 py-2 border text-black border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs resize-none min-h-[2.5rem] max-h-[7.5rem]"
              rows={1}
            />
          </div>

          {/* AI Generate Button */}
          <button
            type="button"
            onClick={handleAIGenerate}
            className={cn(
              "p-2 mb-1.5 rounded-lg transition-colors flex-shrink-0",
              loadingAI
                ? "text-purple-400 cursor-not-allowed"
                : "text-purple-600 hover:bg-purple-50"
            )}
            title="Generate suggestions"
            disabled={loadingAI}
          >
            {loadingAI ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles size={18} />
            )}
          </button>

          {/* Send Button */}
          <button
            type="submit"
            onClick={(e) => {
              console.log("Send button clicked");
              // Fallback: also trigger handleSendMessage directly
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
              "p-2 mb-1.5 rounded-lg transition-colors flex-shrink-0",
              (newMessage.trim() || attachedFiles.length > 0) &&
                !sending &&
                conversationId
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-200 text-gray-400"
            )}
          >
            {sending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </form>

        {/* Payment Modal */}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          conversationId={conversationId}
          customerEmail=""
          onPaymentCreated={async (payment) => {
            console.log("Payment created:", payment);
            // Close the modal - the payment message will be added via socket from backend
            setShowPaymentModal(false);

            // Force refresh conversation data as fallback if socket doesn't work
            setTimeout(async () => {
              try {
                console.log(
                  "Refreshing conversation after payment creation..."
                );
                const data = await chatAPI.getConversation(conversationId);

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
            }, 1000); // Wait 1 second for backend to process
          }}
        />
      </div>
    </div>
  );
}
