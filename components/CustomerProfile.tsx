"use client";

import {
  X,
  MessageSquare,
  Phone,
  Mail,
  ChevronDown,
  ArrowLeft,
  Clock,
  DollarSign,
  User,
  Activity,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Conversation, customerAPI } from "@/lib/api";

interface CustomerProfileProps {
  conversationId: string;
  conversationData?: Conversation | null;
  onClose: () => void;
  onStatusUpdate?: (
    conversationId: string,
    newStatus: string,
    statusColor: string
  ) => void;
}

interface ActivityItem {
  id: string;
  type: "payment" | "call" | "message";
  title: string;
  description?: string;
  timestamp: string;
  status?: string;
  amount?: number;
  currency?: string;
  direction?: string;
  duration?: number;
  paymentUrl?: string;
  sender?: string;
  content?: string;
}

interface CustomerData {
  id: string;
  name: string;
  phone: string;
  email: string;
  status?: string;
  statusColor?: string;
}

export default function CustomerProfile({
  conversationId,
  conversationData,
  onClose,
  onStatusUpdate,
}: CustomerProfileProps) {
  const [activeTab, setActiveTab] = useState<"details" | "activity">("details");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Load customer data and activities on mount
  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        setLoading(true);
        let finalCustomerData = null;

        // If we have conversation data, use it, otherwise fetch from API
        if (conversationData) {
          finalCustomerData = {
            id: conversationData.id, // Use conversation ID as fallback
            name: conversationData.name || "Unknown",
            phone: conversationData.phone || "",
            email: conversationData.email || "",
            status: conversationData.status || "NEW",
            statusColor: conversationData.statusColor || undefined,
          };
          setCustomerData(finalCustomerData);
        } else {
          // Fetch customer data from conversation
          const customerResponse = await customerAPI.getCustomerByConversation(
            conversationId
          );
          if (customerResponse.success && customerResponse.data) {
            finalCustomerData = {
              ...customerResponse.data,
              id: customerResponse.data.id || conversationId, // Ensure id is always present
            };
            setCustomerData(finalCustomerData);
          } else {
            setError(
              customerResponse.message || "Failed to load customer data"
            );
            // Use fallback data if API fails
            finalCustomerData = {
              id: conversationId, // Use conversationId as customer ID fallback
              name: "Unknown Customer",
              phone: "",
              email: "",
              status: "NEW",
              statusColor: undefined,
            };
            setCustomerData(finalCustomerData);
          }
        }

        // Now fetch activities using the customer ID we have or the conversationId as fallback
        const customerId = finalCustomerData?.id || conversationId;
        console.log("🔍 Fetching activities for:", {
          customerId,
          conversationId,
        });

        const activitiesResponse = await customerAPI.getCustomerActivities(
          customerId,
          conversationId // Pass conversationId as well
        );

        if (activitiesResponse.success && activitiesResponse.data) {
          setActivities(activitiesResponse.data);
        } else {
          setError(activitiesResponse.message || "Failed to load activities");
        }
      } catch (err) {
        console.error("Error loading customer data:", err);
        setError("Failed to load customer data");
        // Use fallback data if API fails
        setCustomerData({
          id: conversationId,
          name: conversationData?.name || "Unknown Customer",
          phone: conversationData?.phone || "",
          email: conversationData?.email || "",
          status: conversationData?.status || "NEW",
          statusColor: conversationData?.statusColor || undefined,
        });
      } finally {
        setLoading(false);
      }
    };

    loadCustomerData();
  }, [conversationId, conversationData]);

  // Use customer data or fallback
  const customer = customerData || {
    name: "Loading...",
    phone: "",
    email: "",
    status: "NEW",
    statusColor: undefined,
  };

  // Generate avatar from name
  const getAvatar = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate status color and styling
  const getStatusStyle = (status: string) => {
    const styles: { [key: string]: { bg: string; text: string; dot: string } } =
      {
        NEW: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
        QUALIFYING: {
          bg: "bg-amber-50",
          text: "text-amber-700",
          dot: "bg-amber-500",
        },
        "ESTIMATES SENT": {
          bg: "bg-orange-50",
          text: "text-orange-700",
          dot: "bg-orange-500",
        },
        SERVICES: {
          bg: "bg-purple-50",
          text: "text-purple-700",
          dot: "bg-purple-500",
        },
        "PAYMENTS SENT": {
          bg: "bg-indigo-50",
          text: "text-indigo-700",
          dot: "bg-indigo-500",
        },
        WON: {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          dot: "bg-emerald-500",
        },
        UNQUALIFIED: {
          bg: "bg-gray-50",
          text: "text-gray-700",
          dot: "bg-gray-500",
        },
        LOST: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
      };
    return styles[status.toUpperCase()] || styles.NEW;
  };

  const getActivityIcon = (activity: ActivityItem) => {
    if (activity.type === "payment") return <DollarSign size={14} />;
    if (activity.type === "call") return <Phone size={14} />;
    return <MessageSquare size={14} />;
  };

  const avatar = getAvatar(customer.name);
  const statusStyle = getStatusStyle(customer.status || "NEW");

  const statusOptions = [
    "New",
    "Qualifying",
    "Estimates sent",
    "Services",
    "Payments sent",
    "Won",
    "Unqualified",
    "Lost",
  ];

  // Function to update customer status
  const updateCustomerStatus = async (newStatus: string) => {
    try {
      console.log("🔄 CustomerProfile: Starting status update:", {
        conversationId,
        newStatus,
      });
      setStatusUpdating(true);
      setError("");

      // Update the backend
      const response = await customerAPI.updateCustomerStatus(
        conversationId,
        newStatus
      );

      console.log("📡 CustomerProfile: API response:", response);

      if (response.success) {
        console.log("✅ CustomerProfile: Status update successful");
        // Update local customer data
        setCustomerData((prev) =>
          prev
            ? {
                ...prev,
                status: newStatus,
                statusColor: response.data?.statusColor || prev.statusColor,
              }
            : null
        );

        // Update conversation data if available (for parent component)
        if (conversationData && typeof conversationData === "object") {
          conversationData.status = newStatus;
          if (response.data?.statusColor) {
            conversationData.statusColor = response.data.statusColor;
          }
        }

        // Notify parent component about status update
        if (onStatusUpdate && response.data?.statusColor) {
          onStatusUpdate(conversationId, newStatus, response.data.statusColor);
        }

        setStatusDropdownOpen(false);
      } else {
        console.log(
          "❌ CustomerProfile: API returned error:",
          response.message
        );
        setError(response.message || "Failed to update status");
      }
    } catch (err) {
      console.error("💥 CustomerProfile: Caught error:", err);
      setError("Failed to update status");
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-gray-50 to-white shadow-2xl flex flex-col text-sm">
      {/* Header - Enhanced with gradient - FIXED */}
      <div className="flex items-center px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50 flex-shrink-0 z-10 backdrop-blur-sm">
        <button
          onClick={onClose}
          className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-all duration-200 mr-3 md:hidden hover:scale-105"
        >
          <ArrowLeft size={16} />
        </button>

        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="relative">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold shadow-lg",
                customer.statusColor
                  ? customer.statusColor
                  : "bg-gradient-to-br from-blue-500 to-blue-600"
              )}
            >
              {avatar}
            </div>
            <div
              className={`absolute -bottom-1 -right-1 w-4 h-4 ${statusStyle.dot} rounded-full border-2 border-white shadow-sm`}
            ></div>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-gray-900 truncate text-base">
              {customer.name
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </h2>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-all duration-200 hidden md:block hover:scale-105"
        >
          <X size={16} />
        </button>
      </div>

      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 scroll-smooth">
        {/* Error Display - Enhanced */}
        {error && (
          <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg shadow-sm">
            <p className="text-sm text-red-600 flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              {error}
            </p>
          </div>
        )}

        {/* Profile Section - Redesigned */}
        <div className="px-6 py-6 text-center bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
          <div className="relative inline-block mb-4">
            <div
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg",
                customer.statusColor
                  ? customer.statusColor
                  : "bg-gradient-to-br from-blue-500 to-blue-600"
              )}
            >
              {avatar}
            </div>
            <div
              className={`absolute -bottom-1 -right-1 w-6 h-6 ${statusStyle.dot} rounded-full border-3 border-white shadow-md`}
            ></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {customer.name
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
          </h3>
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusStyle.bg} ${statusStyle.text} mb-3`}
          >
            <div
              className={`w-2 h-2 ${statusStyle.dot} rounded-full mr-2`}
            ></div>
            {customer.status}
          </div>
          <p className="text-gray-600">{customer.phone}</p>
        </div>

        {/* Action Buttons - Enhanced */}
        <div className="px-6 py-4 border-b border-gray-100 bg-white">
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={onClose}
              className="flex flex-col items-center p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 group"
            >
              <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-blue-100 transition-colors duration-200 mb-2">
                <MessageSquare size={18} />
              </div>
              <span className="text-xs font-medium">Message</span>
            </button>
            <button className="flex flex-col items-center p-3 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 group">
              <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-green-100 transition-colors duration-200 mb-2">
                <Phone size={18} />
              </div>
              <span className="text-xs font-medium">Call</span>
            </button>
            <button className="flex flex-col items-center p-3 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 group">
              <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-purple-100 transition-colors duration-200 mb-2">
                <Mail size={18} />
              </div>
              <span className="text-xs font-medium">Email</span>
            </button>
          </div>
        </div>

        {/* Recent Activity Preview - Enhanced */}
        <div className="px-6 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center">
              <Activity size={16} className="mr-2 text-gray-500" />
              RECENT ACTIVITY
            </h3>
            {activities.length > 2 && (
              <button
                onClick={() => setActiveTab("activity")}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                View all
              </button>
            )}
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-sm text-gray-500">
                  Loading activities...
                </span>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Activity size={20} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">No recent activity</p>
              </div>
            ) : (
              activities.slice(0, 2).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm",
                      activity.type === "payment" &&
                        "bg-green-100 text-green-600",
                      activity.type === "call" &&
                        activity.status === "missed" &&
                        "bg-red-100 text-red-600",
                      activity.type === "call" &&
                        activity.status !== "missed" &&
                        "bg-blue-100 text-blue-600",
                      activity.type === "message" &&
                        activity.title === "Message sent" &&
                        "bg-blue-100 text-blue-600",
                      activity.type === "message" &&
                        activity.title === "Message received" &&
                        "bg-gray-100 text-gray-600",
                      activity.type === "message" &&
                        activity.title === "AI message sent" &&
                        "bg-purple-100 text-purple-600"
                    )}
                  >
                    {getActivityIcon(activity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    {activity.description && (
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {activity.description}
                      </p>
                    )}
                    {activity.type === "message" && activity.content && (
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {activity.content}
                      </p>
                    )}
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <Clock size={12} className="mr-1" />
                      {activity.timestamp} ago
                    </div>
                  </div>
                  {activity.amount && (
                    <div className="text-sm font-semibold text-green-600">
                      ${(activity.amount / 100).toFixed(2)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tabs - Enhanced */}
        <div className="flex border-b border-gray-200 bg-white sticky top-0 z-10">
          <button
            onClick={() => setActiveTab("details")}
            className={cn(
              "flex-1 py-4 text-sm font-medium transition-all duration-200 relative",
              activeTab === "details"
                ? "text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <User size={16} className="inline mr-2" />
            Details
            {activeTab === "details" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={cn(
              "flex-1 py-4 text-sm font-medium transition-all duration-200 relative",
              activeTab === "activity"
                ? "text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Activity size={16} className="inline mr-2" />
            Activity
            {activeTab === "activity" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
            )}
          </button>
        </div>

        {/* Content - Enhanced */}
        <div className="flex-1 px-6 py-6">
          {activeTab === "details" && (
            <div className="space-y-6">
              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  STATUS
                </label>
                <div className="relative">
                  <button
                    onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-white text-left transition-all duration-200 hover:bg-gray-50 hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-3 h-3 ${statusStyle.dot} rounded-full mr-3`}
                      ></div>
                      <span className="text-sm text-gray-900 font-medium">
                        {customer.status}
                      </span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={cn(
                        "text-gray-500 transition-transform duration-200",
                        statusDropdownOpen && "rotate-180"
                      )}
                    />
                  </button>
                  {statusDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-20 overflow-hidden">
                      {statusOptions.map((status) => (
                        <button
                          key={status}
                          className="w-full px-4 py-3 text-sm text-left hover:bg-gray-50 transition-colors duration-200 flex items-center disabled:opacity-50"
                          disabled={statusUpdating}
                          onClick={() => {
                            updateCustomerStatus(status.toUpperCase());
                          }}
                        >
                          <div
                            className={`w-3 h-3 ${
                              getStatusStyle(status).dot
                            } rounded-full mr-3`}
                          ></div>
                          {status}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    NAME
                  </label>
                  <p className="text-sm text-gray-900 font-medium">
                    {customer.name}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    PHONE
                  </label>
                  <p className="text-sm text-gray-900 font-medium">
                    {customer.phone || "Not provided"}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    EMAIL
                  </label>
                  <p className="text-sm text-gray-900 font-medium">
                    {customer.email || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-500">
                    Loading activities...
                  </span>
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No activities yet
                  </h3>
                  <p className="text-sm text-gray-500">
                    Activities will appear here as they happen
                  </p>
                </div>
              ) : (
                activities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className={cn(
                      "border-b border-gray-100 pb-4 last:border-b-0",
                      index === 0 && "pt-0"
                    )}
                  >
                    <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm",
                          activity.type === "payment" &&
                            "bg-green-100 text-green-600",
                          activity.type === "call" &&
                            activity.status === "missed" &&
                            "bg-red-100 text-red-600",
                          activity.type === "call" &&
                            activity.status !== "missed" &&
                            "bg-blue-100 text-blue-600",
                          activity.type === "message" &&
                            "bg-gray-100 text-gray-600"
                        )}
                      >
                        {getActivityIcon(activity)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">
                          {activity.title}
                        </h4>
                        {activity.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            {activity.description}
                          </p>
                        )}
                        {activity.type === "message" && activity.content && (
                          <div className="bg-gray-50 rounded-lg p-3 mb-2">
                            <p className="text-sm text-gray-700">
                              {activity.content}
                            </p>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock size={12} className="mr-1" />
                            {activity.timestamp} ago
                          </div>
                          {activity.amount && (
                            <div className="text-sm font-semibold text-green-600">
                              ${(activity.amount / 100).toFixed(2)}
                            </div>
                          )}
                          {activity.duration && (
                            <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                              {Math.floor(activity.duration / 60)}m{" "}
                              {activity.duration % 60}s
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
