"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  X,
  Users,
  Calendar,
  Send,
  Loader2,
  Plus,
  Trash2,
  Search,
  UserCheck,
  Phone,
  Mail,
  Sparkles,
} from "lucide-react";
import {
  bulkMessageAPI,
  chatAPI,
  widgetAPI,
  aiAPI,
  type Conversation,
} from "@/lib/api";
import { useUser } from "@clerk/nextjs";

interface BulkMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function BulkMessageModal({
  isOpen,
  onClose,
  onSuccess,
}: BulkMessageModalProps) {
  const { user } = useUser();
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [recipients, setRecipients] = useState<string[]>([""]);
  const [isLoading, setIsLoading] = useState(false);
  const [scheduledFor, setScheduledFor] = useState("");

  // AI generation state
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [businessInfo, setBusinessInfo] = useState<any>(null);

  // New state for conversations and recipient selection
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversations, setSelectedConversations] = useState<string[]>(
    []
  );
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [conversationError, setConversationError] = useState<string | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [recipientMode, setRecipientMode] = useState<
    "manual" | "conversations"
  >("conversations");

  const fetchBusinessInfo = useCallback(async () => {
    if (!user?.id) return;

    try {
      const businessData = await widgetAPI.getBusinessInfo(user.id);
      if (businessData.success && businessData.businessInfo) {
        setBusinessInfo(businessData.businessInfo);
      }
    } catch (error) {
      console.error("Error fetching business info:", error);
      // Business info is optional, so we don't show error to user
    }
  }, [user?.id]);

  const fetchConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    setConversationError(null);
    try {
      const conversationsData = await chatAPI.getConversations();
      setConversations(conversationsData);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      // More specific error handling
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes("Network Error") ||
        errorMessage.includes("timeout")
      ) {
        setConversationError(
          "Connection timeout. Please check your network connection and try again."
        );
      } else if (errorMessage.includes("500")) {
        setConversationError("Server error. Please try again in a moment.");
      } else {
        setConversationError("Failed to load conversations. Please try again.");
      }
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  // Fetch conversations when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchConversations();
      fetchBusinessInfo();
    }
  }, [isOpen, fetchConversations, fetchBusinessInfo]);

  const handleGenerateAI = async () => {
    if (!user?.id) {
      alert("Please sign in to use AI generation");
      return;
    }

    setIsGeneratingAI(true);
    try {
      const aiMessage = await aiAPI.generateBulkMessage(businessInfo, title);
      setMessage(aiMessage);
    } catch (error) {
      console.error("Error generating AI message:", error);
      alert("Failed to generate AI message. Please try again.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter(
    (conv) =>
      conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversations((prev) => {
      if (prev.includes(conversationId)) {
        return prev.filter((id) => id !== conversationId);
      } else {
        return [...prev, conversationId];
      }
    });
  };

  const selectAllConversations = () => {
    setSelectedConversations(filteredConversations.map((conv) => conv.id));
  };

  const deselectAllConversations = () => {
    setSelectedConversations([]);
  };

  const addRecipient = () => {
    setRecipients([...recipients, ""]);
  };

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const updateRecipient = (index: number, value: string) => {
    const newRecipients = [...recipients];
    newRecipients[index] = value;
    setRecipients(newRecipients);
  };

  const handleSubmit = async (type: "send" | "schedule") => {
    if (!message.trim() || !title.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    // Prevent sending immediately if schedule date is set
    if (type === "send" && scheduledFor) {
      alert(
        "You have set a schedule date. Please use the Schedule button instead."
      );
      return;
    }

    let finalRecipients: string[] = [];

    if (recipientMode === "conversations") {
      if (selectedConversations.length === 0) {
        alert("Please select at least one conversation");
        return;
      }

      // Send the original _id values (remove the 'id' mapping) to backend
      finalRecipients = selectedConversations.map((convId) => {
        const conversation = conversations.find((c) => c.id === convId);
        return conversation?._id || convId; // Use _id if available, fallback to convId
      });
    } else {
      // Manual mode
      const validRecipients = recipients.filter((r) => r.trim());
      if (validRecipients.length === 0) {
        alert("Please add at least one recipient");
        return;
      }
      finalRecipients = validRecipients;
    }

    if (type === "schedule" && !scheduledFor) {
      alert("Please select a schedule time");
      return;
    }

    setIsLoading(true);
    try {
      // Convert scheduledFor to ISO string with proper timezone
      let scheduledDateISO = undefined;
      if (type === "schedule" && scheduledFor) {
        // datetime-local gives us "2025-10-15T12:33" without timezone
        // Parse as local time by appending timezone info
        // Split the datetime string and create a proper local Date
        const [datePart, timePart] = scheduledFor.split("T");
        const [year, month, day] = datePart.split("-").map(Number);
        const [hour, minute] = timePart.split(":").map(Number);
        
        // Create date in local timezone
        const localDate = new Date(year, month - 1, day, hour, minute);
        scheduledDateISO = localDate.toISOString();
        
        console.log("📅 Schedule conversion:", {
          input: scheduledFor,
          parsed: { year, month, day, hour, minute },
          localDate: localDate.toString(),
          isoString: scheduledDateISO,
        });
      }

      const bulkMessageData = {
        title,
        message,
        recipients: finalRecipients,
        ...(type === "schedule" && { scheduledDate: scheduledDateISO }),
      };

      await bulkMessageAPI.createBulkMessage(bulkMessageData);
      console.log(
        type === "send"
          ? "Message sent successfully!"
          : "Message scheduled successfully!"
      );
      onSuccess?.();
      onClose();

      // Reset form
      setMessage("");
      setTitle("");
      setRecipients([""]);
      setScheduledFor("");
      setSelectedConversations([]);
      setSearchTerm("");
    } catch (error) {
      console.error("Error sending bulk message:", error);
      alert("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setMessage("");
    setTitle("");
    setRecipients([""]);
    setScheduledFor("");
    setSelectedConversations([]);
    setSearchTerm("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-xl font-semibold">
            Send Bulk Message
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recipients Field */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Recipients</Label>

            {/* Recipient Mode Toggle */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={
                  recipientMode === "conversations" ? "default" : "outline"
                }
                size="sm"
                onClick={() => setRecipientMode("conversations")}
              >
                <Users className="h-4 w-4 mr-2" />
                Select from Conversations
              </Button>
              <Button
                type="button"
                variant={recipientMode === "manual" ? "default" : "outline"}
                size="sm"
                onClick={() => setRecipientMode("manual")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Manually
              </Button>
            </div>

            {/* Conversations Mode */}
            {recipientMode === "conversations" && (
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Select All/None */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {selectedConversations.length} of{" "}
                    {filteredConversations.length} selected
                  </span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={selectAllConversations}
                    >
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={deselectAllConversations}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>

                {/* Conversations List */}
                <div className="max-h-64 overflow-y-auto border rounded-md">
                  {isLoadingConversations ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="ml-2">Loading conversations...</span>
                    </div>
                  ) : conversationError ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="text-red-500 mb-4">
                        <X className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">{conversationError}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchConversations}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Loader2 className="h-4 w-4 mr-2" />
                        Retry
                      </Button>
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="flex items-center justify-center py-8 text-gray-500">
                      <Users className="h-6 w-6 mr-2" />
                      No conversations found
                    </div>
                  ) : (
                    filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 ${
                          selectedConversations.includes(conversation.id)
                            ? "bg-blue-50"
                            : ""
                        }`}
                        onClick={() =>
                          handleConversationSelect(conversation.id)
                        }
                      >
                        <input
                          type="checkbox"
                          checked={selectedConversations.includes(
                            conversation.id
                          )}
                          onChange={() =>
                            handleConversationSelect(conversation.id)
                          }
                          className="mr-3"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {conversation.name}
                            </span>
                            {conversation.phone && (
                              <Badge variant="secondary" className="text-xs">
                                <Phone className="h-3 w-3 mr-1" />
                                {conversation.phone}
                              </Badge>
                            )}
                            {conversation.email && (
                              <Badge variant="secondary" className="text-xs">
                                <Mail className="h-3 w-3 mr-1" />
                                {conversation.email}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.lastMessage &&
                            conversation.lastMessage.length > 80
                              ? conversation.lastMessage.slice(0, 70) + "..."
                              : conversation.lastMessage}
                          </p>
                        </div>
                        <UserCheck
                          className={`h-4 w-4 ${
                            selectedConversations.includes(conversation.id)
                              ? "text-blue-600"
                              : "text-gray-400"
                          }`}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Manual Mode */}
            {recipientMode === "manual" && (
              <div className="space-y-2">
                {recipients.map((recipient, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder="Enter phone number or email"
                      value={recipient}
                      onChange={(e) => updateRecipient(index, e.target.value)}
                      className="flex-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                    {recipients.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRecipient(index)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRecipient}
                  className="w-full border-dashed"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Recipient
                </Button>
              </div>
            )}
          </div>

          {/* Schedule Field */}
          <div className="space-y-2">
            <Label htmlFor="schedule" className="text-sm font-medium">
              Schedule (Optional)
            </Label>
            <Input
              id="schedule"
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <Separator />

          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Message Title
            </Label>
            <Input
              id="title"
              placeholder="Enter message title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="message" className="text-sm font-medium">
                Message Content
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateAI}
                disabled={isGeneratingAI}
                className="text-purple-600 border-purple-200 hover:bg-purple-50 hover:border-purple-300"
              >
                {isGeneratingAI ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                {isGeneratingAI ? "Generating..." : "Generate with AI"}
              </Button>
            </div>
            <Textarea
              id="message"
              placeholder="Write your message here"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[200px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Users className="h-3 w-3 mr-1" />
              {recipientMode === "conversations"
                ? `${selectedConversations.length} Conversations`
                : `${recipients.filter((r) => r.trim()).length} Recipients`}
            </Badge>
          </div>

          {/* Marketing Notice */}
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-xs text-gray-600">
              <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              Pro tip: Put a meaningful title to make most out of AI generated
              message feature.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleSubmit("schedule")}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Calendar className="h-4 w-4 mr-2" />
                )}
                Schedule
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => handleSubmit("send")}
                disabled={isLoading || !!scheduledFor}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Now
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
