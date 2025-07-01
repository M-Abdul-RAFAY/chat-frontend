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
import { useState } from "react";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  pathname: string;
  onReviewClick?: () => void; // Add this prop
}

export default function Sidebar({
  collapsed,
  onToggle,
  pathname,
  onReviewClick, // Add this prop
}: SidebarProps) {
  const [conversationFilter, setConversationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("new-lead");

  // Collapsible states
  const [showConversations, setShowConversations] = useState(true);
  const [showActivity, setShowActivity] = useState(true);
  const [showStatus, setShowStatus] = useState(true);

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
    { id: "new-lead", label: "New lead", icon: UserPlus },
    { id: "qualifying", label: "Qualifying", icon: Filter },
    { id: "estimates-sent", label: "Estimates sent", icon: Send },
    { id: "services", label: "Services", icon: Zap },
    { id: "payments-sent", label: "Payments sent", icon: BadgeDollarSign },
    { id: "won", label: "Won", icon: ThumbsUp },
    { id: "unqualified", label: "Unqualified", icon: Ban },
    { id: "lost", label: "Lost", icon: XCircle },
  ];

  const menuItems = [
    {
      icon: Home,
      label: "Dashboard",
      href: "/dashboard/home",
      active: pathname === "/dashboard/home",
    },
    {
      icon: MessageSquare,
      label: "Inbox",
      href: "/dashboard/inbox",
      active: pathname === "/dashboard/inbox",
    },
    {
      icon: Users,
      label: "Contacts",
      href: "/dashboard/contacts",
      active: pathname === "/dashboard/contacts",
    },
    {
      icon: TrendingUp,
      label: "Marketing",
      href: "/dashboard/marketing",
      active: pathname === "/dashboard/marketing",
    },
    {
      icon: Zap,
      label: "Automations",
      href: "/dashboard/automations",
      active: pathname === "/dashboard/automations",
    },
    {
      icon: BarChart,
      label: "Insights",
      href: "/dashboard/insights",
      active: pathname === "/dashboard/insights",
    },
    {
      icon: FileText,
      label: "Reporting",
      href: "/dashboard/reporting",
      active: pathname === "/dashboard/reporting",
    },
    {
      icon: CreditCard,
      label: "Payments",
      href: "/dashboard/payments",
      active: pathname === "/dashboard/payments",
    },
    {
      icon: MessageCircle,
      label: "Widget",
      href: "/dashboard/widget",
      active: pathname === "/dashboard/widget",
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      <div
        className={cn(
          "bg-zinc-900 text-white transition-all duration-300 z-50 flex flex-col",
          collapsed
            ? "w-0 overflow-hidden md:w-16"
            : "w-64 fixed md:relative inset-y-0 left-0 md:w-64"
        )}
      >
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-zinc-900 sticky top-0 z-10">
          {!collapsed && (
            <span className="font-semibold truncate border border-gray-700 rounded-xl px-4 py-1">
              Venture Auto
            </span>
          )}
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
                        onClick={() => setConversationFilter(filter.id)}
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
                          onClick={
                            onReviewClick
                              ? onReviewClick
                              : () => {
                                  window.location.href = "/dashboard/review";
                                }
                          }
                        >
                          <item.icon size={16} className="flex-shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </button>
                      ) : (
                        <button
                          key={item.id}
                          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sm text-gray-400 hover:bg-blue-700 hover:text-white"
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
                        onClick={() => setStatusFilter(status.id)}
                        className={cn(
                          "w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sm",
                          statusFilter === status.id
                            ? "bg-blue-700 text-white"
                            : "text-gray-400 hover:bg-blue-700 hover:text-white"
                        )}
                      >
                        <status.icon size={16} className="flex-shrink-0" />
                        <span className="truncate">{status.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Navigation */}
              <div className="px-4 py-2">
                <div className="space-y-1">
                  {menuItems.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className={cn(
                        "w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sm",
                        item.active
                          ? "bg-blue-700 text-white"
                          : "text-gray-400 hover:bg-blue-700 hover:text-white"
                      )}
                    >
                      <item.icon size={16} className="flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
