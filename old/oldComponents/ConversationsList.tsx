import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  ArrowLeft,
  Loader2,
  Plus,
  MoreVertical,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useChatData, Conversation } from "../../hooks/useChatData";

interface ConversationsListProps {
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversation: Conversation | null;
  onClose: () => void;
  activeFilter: string;
}

const ConversationsList = ({
  onSelectConversation,
  selectedConversation,
  onClose,
  activeFilter,
}: ConversationsListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("OPEN");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const { conversations, loading, error, markAsRead, refreshConversations } =
    useChatData();

  // Filter conversations based on active filter from sidebar
  const getFilteredConversations = () => {
    let filtered = conversations;

    // Apply sidebar filter
    switch (activeFilter) {
      case "assigned":
        // In a real app, this would filter by assigned conversations
        filtered = conversations.filter((conv) => conv.id.length % 2 === 0);
        break;
      case "unassigned":
        filtered = conversations.filter((conv) => conv.id.length % 2 === 1);
        break;
      case "new-lead":
        filtered = conversations.filter((conv) => conv.status === "NEW LEAD");
        break;
      case "won":
        filtered = conversations.filter((conv) => conv.status === "WON");
        break;
      case "payments-sent":
        filtered = conversations.filter(
          (conv) => conv.status === "PAYMENT SENT"
        );
        break;
      // Add more status filters as needed
      default:
        filtered = conversations;
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (conv) =>
          conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply tab filter
    if (activeTab === "CLOSED") {
      filtered = filtered.filter(
        (conv) => conv.status === "WON" || conv.status === "LOST"
      );
    } else {
      filtered = filtered.filter(
        (conv) => conv.status !== "WON" && conv.status !== "LOST"
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "oldest":
        return [...filtered].reverse();
      case "name":
        return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
      case "unread":
        return [...filtered].sort(
          (a, b) => (b.unread ? 1 : 0) - (a.unread ? 1 : 0)
        );
      default:
        return filtered;
    }
  };

  const filteredConversations = getFilteredConversations();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getAvatarColor = (name?: string) => {
    if (!name || typeof name !== "string" || name.length === 0)
      return "bg-gray-500";
    // Generate consistent color based on name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-red-500",
      "bg-yellow-500",
      "bg-teal-500",
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  const handleConversationClick = (conversation: Conversation) => {
    if (conversation.unread) {
      markAsRead(conversation.id);
    }
    onSelectConversation(conversation);
  };

  const getFilterTitle = () => {
    switch (activeFilter) {
      case "assigned":
        return "Assigned to You";
      case "unassigned":
        return "Unassigned";
      case "new-lead":
        return "New Leads";
      case "won":
        return "Won Deals";
      case "payments-sent":
        return "Payment Sent";
      default:
        return "All Conversations";
    }
  };

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "name", label: "Name A-Z" },
    { value: "unread", label: "Unread First" },
  ];

  const filterOptions = [
    { value: "all", label: "All statuses" },
    { value: "unread", label: "Unread only" },
    { value: "leads", label: "New leads only" },
    { value: "active", label: "Active conversations" },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setFilterOpen(false);
      setSortOpen(false);
    };

    if (filterOpen || sortOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [filterOpen, sortOpen]);

  const handleRefresh = async () => {
    await refreshConversations();
  };

  if (loading) {
    return (
      <div className="w-full lg:w-80 bg-white border-r border-gray-200 h-full flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3 text-gray-500">
          <Loader2 size={32} className="animate-spin text-blue-500" />
          <span className="text-sm font-medium">Loading conversations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-80 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 flex-shrink-0 bg-gray-50">
        {/* Header with refresh button */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {getFilterTitle()}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {filteredConversations.length} conversation
              {filteredConversations.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh conversations"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-4">
          <Search
            size={16}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white shadow-sm"
          />
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("OPEN")}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
              activeTab === "OPEN"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            OPEN
          </button>
          <button
            onClick={() => setActiveTab("CLOSED")}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
              activeTab === "CLOSED"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            CLOSED
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-gray-400" />
            </div>
            <p className="text-lg font-medium mb-2">No conversations found</p>
            <p className="text-sm text-gray-400 mb-4">
              {searchTerm
                ? "Try adjusting your search terms"
                : "No conversations match the current filter"}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-blue-600 hover:underline text-sm font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredConversations
              .filter((conv) => conv && conv.id)
              .map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => handleConversationClick(conversation)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200 relative ${
                    selectedConversation?.id === conversation.id
                      ? "bg-blue-50 border-r-4 border-r-blue-500"
                      : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative flex-shrink-0">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${getAvatarColor(
                          conversation.name
                        )} shadow-sm`}
                      >
                        <span className="text-sm font-semibold text-white">
                          {getInitials(conversation.name)}
                        </span>
                      </div>
                      {conversation.unread && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white animate-pulse"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3
                          className={`font-semibold truncate ${
                            conversation.unread
                              ? "text-gray-900"
                              : "text-gray-800"
                          }`}
                        >
                          {conversation.name || "Unknown"}
                        </h3>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {conversation.time}
                        </span>
                      </div>

                      <p
                        className={`text-sm mb-3 line-clamp-2 leading-relaxed ${
                          conversation.unread
                            ? "text-gray-700 font-medium"
                            : "text-gray-600"
                        }`}
                      >
                        {conversation.lastMessage}
                      </p>

                      <div className="flex items-center justify-between">
                        {conversation.status && (
                          <span
                            className={`inline-block px-2 py-1 text-xs font-medium text-white rounded-full ${conversation.statusColor}`}
                          >
                            {conversation.status}
                          </span>
                        )}

                        {conversation.unread && (
                          <div className="flex items-center space-x-1 text-blue-600">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-xs font-medium">New</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsList;
