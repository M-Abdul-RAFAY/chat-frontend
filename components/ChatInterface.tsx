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
  ThumbsUp,
  Smile,
  FileText,
  Image,
  File,
  Download,
  Edit3,
  Trash2,
  Check,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { chatAPI, Conversation, Message } from "@/lib/api";

interface ChatInterfaceProps {
  conversationId: string;
  onToggleProfile: () => void;
  profileVisible: boolean;
  maxSuggestions?: number;
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
  onToggleProfile,
  profileVisible,
  maxSuggestions = 2,
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

  // Message editing and management states
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const editInputRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const customerName = "Will Pantente";
  const customerLocation = "Venture Auto ...";

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

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingMessageId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingMessageId]);

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
        setMessages(data.messages);
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
  }, [conversationId]);

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
    if ((!newMessage.trim() && attachedFiles.length === 0) || !conversationId)
      return;

    try {
      setSending(true);

      // Handle file uploads if present
      let fileInfos: any[] = [];
      if (attachedFiles.length > 0) {
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
      const sentMessage = await chatAPI.sendMessage({
        conversationId: parseInt(conversationId),
        content: messageContent,
        sender: "agent",
      });

      // Update local state
      setMessages((prev) => [
        ...prev,
        {
          id: sentMessage.id,
          sender: "agent",
          content: sentMessage.content,
          time: sentMessage.time,
          avatar: "AG",
        },
      ]);

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
      await chatAPI.markAsRead(parseInt(conversationId));
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleEditMessage = async (messageId: number, newContent: string) => {
    try {
      await chatAPI.editMessage(messageId, newContent);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, content: newContent, edited: true }
            : msg
        )
      );
      setEditingMessageId(null);
      setEditingText("");
    } catch (error) {
      console.error("Error editing message:", error);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    try {
      await chatAPI.deleteMessage(messageId);
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const handleClearChat = async () => {
    try {
      await chatAPI.clearChat(parseInt(conversationId));
      setMessages([]);
      setShowClearConfirm(false);
      setShowMoreMenu(false);
    } catch (error) {
      console.error("Error clearing chat:", error);
    }
  };

  const handleDeleteConversation = async () => {
    try {
      await chatAPI.deleteConversation(parseInt(conversationId));
      setShowDeleteConfirm(false);
      setShowMoreMenu(false);
      // In a real app, you'd navigate away or refresh the conversation list
      window.location.reload();
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  const startEditingMessage = (message: Message) => {
    setEditingMessageId(message.id);
    setEditingText(message.content);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMessageId && editingText.trim()) {
      handleEditMessage(editingMessageId, editingText.trim());
    }
  };

  const canEditMessage = (message: Message, index: number) => {
    // Only allow editing the last agent message
    return message.sender === "agent" && index === messages.length - 1;
  };

  const canDeleteMessage = (message: Message, index: number) => {
    // Only allow deleting the last agent message
    return message.sender === "agent" && index === messages.length - 1;
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
      const fallbackSuggestions = [
        { id: "1", text: "Thank you for reaching out!", type: "quick" },
        {
          id: "2",
          text: "I'd be happy to help you with that.",
          type: "detailed",
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
      { id: "1", text: "Thank you!", type: "quick" },
      { id: "2", text: aiResponse, type: "detailed" },
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
        return <Image className="w-4 h-4" />;
      case "document":
        return <FileText className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
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
        <div
          className="flex items-center space-x-2 min-w-0 cursor-pointer hover:bg-gray-50 rounded-lg p-1 -m-1 transition-colors"
          onClick={onToggleProfile}
        >
          <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0 text-xs">
            WP
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-gray-900 truncate text-sm">
              {customerName}
            </h2>
            <p className="text-xs text-gray-500 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1 flex-shrink-0"></span>
              <span className="truncate">{customerLocation}</span>
            </p>
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

            {showMoreMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                <button
                  onClick={() => {
                    setShowClearConfirm(true);
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Clear Chat</span>
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(true);
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Conversation</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Clear Chat
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to clear all messages in this chat? This
              action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearChat}
                className="flex-1 px-4 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Clear Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Conversation
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this entire conversation? This
              action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConversation}
                className="flex-1 px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages - Scrollable */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-2 py-2 space-y-3"
      >
        <div className="text-center">
          <p className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block">
            This is the beginning of your email conversation.
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">Today at 10:42 AM</p>
        </div>

        {messages.map((message, index) => (
          <div
            key={message.id}
            className={cn(
              "flex items-start group",
              message.sender === "agent" ? "flex-row-reverse" : ""
            )}
          >
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-white flex-shrink-0",
                message.sender === "customer" ? "bg-pink-500" : "bg-blue-500"
              )}
            >
              {message.avatar}
            </div>

            <div
              className={cn(
                "flex items-start min-w-0",
                message.sender === "agent" ? "mr-2" : "ml-2"
              )}
            >
              {editingMessageId === message.id ? (
                // Edit Mode
                <form
                  onSubmit={handleEditSubmit}
                  className="space-y-2 max-w-xs lg:max-w-md"
                >
                  <textarea
                    ref={editInputRef}
                    value={editingText}
                    onChange={(e) => {
                      setEditingText(e.target.value);
                      adjustTextareaHeight(e.target);
                    }}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[2.5rem]"
                    rows={1}
                  />
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors flex items-center space-x-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Save</span>
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                // Normal Message Display
                <div
                  className={cn(
                    "flex items-start",
                    message.sender === "agent"
                      ? "flex-row-reverse space-x-reverse space-x-2"
                      : "space-x-2"
                  )}
                >
                  <div
                    className={cn(
                      "px-3 py-1.5 rounded-2xl text-xs relative inline-block max-w-xs lg:max-w-md",
                      message.sender === "customer"
                        ? "bg-gray-100 text-gray-900"
                        : "bg-blue-500 text-white"
                    )}
                  >
                    <p className="text-xs whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    <div className="flex items-center justify-between mt-0.5">
                      <p
                        className={cn(
                          "text-[10px]",
                          message.sender === "customer"
                            ? "text-gray-500"
                            : "text-blue-100"
                        )}
                      >
                        {message.timestamp}
                        {message.edited && (
                          <span className="ml-1 italic">(edited)</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Message Actions - Only for the last agent message */}
                  {message.sender === "agent" &&
                    (canEditMessage(message, index) ||
                      canDeleteMessage(message, index)) && (
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {canEditMessage(message, index) && (
                          <button
                            onClick={() => startEditingMessage(message)}
                            className="p-1 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                            title="Edit message"
                          >
                            <Edit3 className="w-3 h-3 text-gray-600" />
                          </button>
                        )}
                        {canDeleteMessage(message, index) && (
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="p-1 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-red-50 transition-colors"
                            title="Delete message"
                          >
                            <Trash2 className="w-3 h-3 text-red-600" />
                          </button>
                        )}
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>
        ))}
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

        <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
          <button
            type="button"
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            onClick={handleAttachClick}
          >
            <Paperclip size={18} />
          </button>

          <button
            type="button"
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile size={18} />
          </button>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx"
          />

          <div className="flex-1">
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
              "p-2 rounded-lg transition-colors flex-shrink-0",
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
            disabled={
              (!newMessage.trim() && attachedFiles.length === 0) || sending
            }
            className={cn(
              "p-2 rounded-lg transition-colors flex-shrink-0",
              (newMessage.trim() || attachedFiles.length > 0) && !sending
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
      </div>
    </div>
  );
}
