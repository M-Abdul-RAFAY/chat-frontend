"use client";

import {
  Inbox,
  TrendingUp,
  BarChart3,
  Zap,
  MessageSquare,
  UserCheck,
  UserX,
  Star,
  Phone,
  Menu,
  X,
  UserPlus,
  Filter,
  Send,
  BadgeDollarSign,
  ThumbsUp,
  Ban,
  XCircle,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  Home,
  Users,
  BarChart,
  FileText,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { chatAPI, Conversation } from "@/lib/api";
import { showToast } from "@/lib/toast";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  pathname: string;
  onReviewClick?: () => void;
  onStatusFilter?: (status: string) => void; // Add callback for status filtering
  onConversationFilter?: (filter: string) => void; // Add callback for conversation filtering
}

export default function Sidebar({
  collapsed,
  onToggle,
  pathname,
  onReviewClick,
  onStatusFilter,
  onConversationFilter,
}: SidebarProps) {
  const [conversationFilter, setConversationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  // Collapsible states
  const [showConversations, setShowConversations] = useState(true);
  const [showActivity, setShowActivity] = useState(true);
  const [showStatus, setShowStatus] = useState(true);

  // Helper function to handle coming soon features
  const handleComingSoonFeature = (
    featureName: string,
    originalAction?: () => void
  ) => {
    const isComingSoon = process.env.NEXT_PUBLIC_IS_COMMING_SOON === "true";

    if (isComingSoon) {
      showToast.info("This feature will come soon");
      return;
    }

    // If feature is enabled, execute the original action
    if (originalAction) {
      originalAction();
    }
  };

  const conversationFilters = [
    {
      id: "all",
      icon: MessageSquare,
      label: "All Conversations",
      active: true,
    },
    { id: "assigned", icon: UserCheck, label: "Assigned to You" },
    { id: "unassigned", icon: UserX, label: "Unassigned" },
  ];

  const activityItems = [
    { id: "reviews", icon: Star, label: "Reviews" },
    { id: "calls", icon: Phone, label: "Calls" },
  ];

  // Use icons instead of color for statusItems
  const statusItems = [
    { id: "new-lead", label: "New lead", icon: UserPlus, status: "NEW LEAD" },
    {
      id: "qualifying",
      label: "Qualifying",
      icon: Filter,
      status: "QUALIFYING",
    },
    {
      id: "estimates-sent",
      label: "Estimates sent",
      icon: Send,
      status: "ESTIMATES SENT",
    },
    { id: "services", label: "Services", icon: Zap, status: "SERVICES" },
    {
      id: "payments-sent",
      label: "Payments sent",
      icon: BadgeDollarSign,
      status: "PAYMENTS SENT",
    },
    { id: "won", label: "Won", icon: ThumbsUp, status: "WON" },
    {
      id: "unqualified",
      label: "Unqualified",
      icon: Ban,
      status: "UNQUALIFIED",
    },
    { id: "lost", label: "Lost", icon: XCircle, status: "LOST" },
  ];

  // Fetch conversations and calculate status counts
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const conversationsData = await chatAPI.getConversations();
        setConversations(conversationsData);

        // Calculate status counts
        const counts: Record<string, number> = {};
        statusItems.forEach((item) => {
          counts[item.id] = conversationsData.filter(
            (conv) => conv.status?.toUpperCase() === item.status.toUpperCase()
          ).length;
        });
        setStatusCounts(counts);
      } catch (error) {
        console.error("Error fetching conversations for sidebar:", error);
      }
    };

    fetchConversations();

    // Set up interval to refresh counts every 30 seconds
    const interval = setInterval(fetchConversations, 30000);

    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle status filter change
  const handleStatusFilterChange = (statusId: string) => {
    setStatusFilter(statusId);
    // Clear conversation filter when status is selected
    setConversationFilter("");
    if (onStatusFilter) {
      const statusItem = statusItems.find((item) => item.id === statusId);
      onStatusFilter(statusItem?.status || statusId);
    }

    // Auto-collapse sidebar on small screens when status is selected
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      onToggle();
    }
  };

  // Handle conversation filter change
  const handleConversationFilterChange = (filterId: string) => {
    setConversationFilter(filterId);
    // Clear status filter when conversation filter is selected
    if (filterId !== "") {
      setStatusFilter("");
    }
    if (onConversationFilter) {
      onConversationFilter(filterId);
    }

    // Auto-collapse sidebar on small screens when filter is selected
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      onToggle();
    }
  };

  return (
    <>
      <div
        className={cn(
          "bg-zinc-900 text-white transition-all duration-300 z-40 flex flex-col h-full",
          collapsed
            ? "w-16 md:w-16" // Show collapsed sidebar (16px) on all screen sizes
            : "w-64 md:w-64"
        )}
      >
        {/* Header - Fixed */}
        <div className="flex items-center justify-center p-4 border-b border-gray-700 bg-zinc-900 sticky top-0 z-10">
          <button
            onClick={onToggle}
            className="p-1 hover:bg-blue-700 rounded transition-colors flex-shrink-0"
          >
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* Navigation */}
          {!collapsed && (
            <>
              {/* Conversation Filters */}
              <div className="px-4 py-2">
                <div
                  className="flex items-center space-x-2 mb-3 cursor-pointer select-none"
                  onClick={() => setShowConversations((v) => !v)}
                >
                  <Inbox size={16} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-400 truncate">
                    CONVERSATIONS
                  </span>
                  <span className="ml-auto">
                    {showConversations ? (
                      <ChevronDown size={16} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={16} className="text-gray-400" />
                    )}
                  </span>
                </div>
                {showConversations && (
                  <div className="space-y-1">
                    {conversationFilters.map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() =>
                          handleConversationFilterChange(filter.id)
                        }
                        className={cn(
                          "w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sm",
                          conversationFilter === filter.id
                            ? "bg-blue-700 text-white"
                            : "text-gray-400 hover:bg-blue-700 hover:text-white"
                        )}
                      >
                        <filter.icon size={16} className="flex-shrink-0" />
                        <span className="truncate">{filter.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Activity */}
              <div className="px-4 py-2">
                <div
                  className="flex items-center space-x-2 mb-3 cursor-pointer select-none"
                  onClick={() => setShowActivity((v) => !v)}
                >
                  <TrendingUp
                    size={16}
                    className="text-gray-400 flex-shrink-0"
                  />
                  <span className="text-sm font-medium text-gray-400 truncate">
                    ACTIVITY
                  </span>
                  <span className="ml-auto">
                    {showActivity ? (
                      <ChevronDown size={16} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={16} className="text-gray-400" />
                    )}
                  </span>
                </div>
                {showActivity && (
                  <div className="space-y-1">
                    {activityItems.map((item) =>
                      item.id === "reviews" ? (
                        <button
                          key={item.id}
                          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sm text-gray-400 hover:bg-blue-700 hover:text-white"
                          onClick={() => {
                            handleComingSoonFeature("Reviews", () => {
                              if (onReviewClick) {
                                onReviewClick();
                              } else {
                                window.location.href = "/dashboard/review";
                              }
                              // Auto-collapse sidebar on small screens when review is clicked
                              if (
                                typeof window !== "undefined" &&
                                window.innerWidth < 768
                              ) {
                                onToggle();
                              }
                            });
                          }}
                        >
                          <item.icon size={16} className="flex-shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </button>
                      ) : (
                        <button
                          key={item.id}
                          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sm text-gray-400 hover:bg-blue-700 hover:text-white"
                          onClick={() => {
                            handleComingSoonFeature("Calls", () => {
                              // Auto-collapse sidebar on small screens when activity item is clicked
                              if (
                                typeof window !== "undefined" &&
                                window.innerWidth < 768
                              ) {
                                onToggle();
                              }
                            });
                          }}
                        >
                          <item.icon size={16} className="flex-shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="px-4 py-2">
                <div
                  className="flex items-center space-x-2 mb-3 cursor-pointer select-none"
                  onClick={() => setShowStatus((v) => !v)}
                >
                  <BarChart3
                    size={16}
                    className="text-gray-400 flex-shrink-0"
                  />
                  <span className="text-sm font-medium text-gray-400 truncate">
                    STATUS
                  </span>
                  <span className="ml-auto">
                    {showStatus ? (
                      <ChevronDown size={16} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={16} className="text-gray-400" />
                    )}
                  </span>
                </div>
                {showStatus && (
                  <div className="space-y-1">
                    {statusItems.map((status) => (
                      <button
                        key={status.id}
                        onClick={() => handleStatusFilterChange(status.id)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-sm",
                          statusFilter === status.id
                            ? "bg-blue-700 text-white"
                            : "text-gray-400 hover:bg-blue-700 hover:text-white"
                        )}
                      >
                        <div className="flex items-center space-x-3">
                          <status.icon size={16} className="flex-shrink-0" />
                          <span className="truncate">{status.label}</span>
                        </div>
                        {/* Status count badge */}
                        {statusCounts[status.id] !== undefined && (
                          <span
                            className={cn(
                              "inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full",
                              statusFilter === status.id
                                ? "bg-white text-blue-700"
                                : "bg-gray-700 text-gray-300"
                            )}
                          >
                            {statusCounts[status.id]}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
