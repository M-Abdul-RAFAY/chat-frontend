"use client";

import {
  X,
  MessageSquare,
  Phone,
  Mail,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Conversation, customerAPI } from "@/lib/api";

interface CustomerProfileProps {
  conversationId: string;
  conversationData?: Conversation | null;
  onClose: () => void;
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
}

export default function CustomerProfile({
  conversationId,
  conversationData,
  onClose,
}: CustomerProfileProps) {
  const [activeTab, setActiveTab] = useState<"details" | "activity">("details");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

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

  // Generate status color
  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      NEW: "bg-blue-500",
      QUALIFYING: "bg-yellow-500",
      "ESTIMATES SENT": "bg-orange-500",
      SERVICES: "bg-purple-500",
      "PAYMENTS SENT": "bg-indigo-500",
      WON: "bg-green-500",
      UNQUALIFIED: "bg-gray-500",
      LOST: "bg-red-500",
    };
    return colors[status.toUpperCase()] || "bg-blue-500";
  };

  const avatar = getAvatar(customer.name);
  const statusColor = getStatusColor(customer.status || "NEW");

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

  return (
    <div className="w-full h-full bg-white shadow-2xl flex flex-col text-[12px] overflow-hidden">
      {/* Header - Fixed */}
      <div className="flex items-center px-2 py-2 border-b border-gray-200 bg-white sticky top-0 z-10">
        <button
          onClick={onClose}
          className="p-1 -ml-1 text-gray-500 hover:bg-gray-100 rounded-full transition-colors mr-2 md:hidden"
        >
          <ArrowLeft size={14} />
        </button>

        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <div
            className={`w-7 h-7 ${statusColor} rounded-full flex items-center justify-center text-white font-medium flex-shrink-0 text-[11px]`}
          >
            {avatar}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-gray-900 truncate text-[12px]">
              {customer.name
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </h2>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-gray-500 hover:bg-gray-100 rounded-full transition-colors hidden md:block"
        >
          <X size={14} />
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-2 mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-[10px] text-red-600">{error}</p>
        </div>
      )}

      {/* Profile Image Section */}
      <div className="px-2 py-3 text-center border-b border-gray-200 bg-gray-50">
        <div
          className={`w-12 h-12 ${statusColor} rounded-full flex items-center justify-center text-white font-bold text-[14px] mx-auto mb-2`}
        >
          {avatar}
        </div>
        <h3 className="text-[12px] font-semibold text-gray-900 mb-1">
          {customer.name
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
        </h3>
        <p className="text-[11px] text-gray-500">{customer.phone}</p>
      </div>

      {/* Action Buttons */}
      <div className="px-3 py-3 border-b border-gray-200 bg-white">
        <div className="grid grid-cols-3 gap-3">
          <button className="flex flex-col items-center p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <MessageSquare size={16} className="mb-1" />
            <span className="text-[10px]">Message</span>
          </button>
          <button className="flex flex-col items-center p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Phone size={16} className="mb-1" />
            <span className="text-[10px]">Call</span>
          </button>
          <button className="flex flex-col items-center p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Mail size={16} className="mb-1" />
            <span className="text-[10px]">Email</span>
          </button>
        </div>
      </div>

      {/* Recent Activity Preview */}
      <div className="px-3 py-3 border-b border-gray-200 bg-white">
        <h3 className="text-[11px] font-medium text-gray-900 mb-2">
          RECENT ACTIVITY
        </h3>
        <div className="space-y-3">
          {loading ? (
            <div className="text-[10px] text-gray-500">
              Loading activities...
            </div>
          ) : activities.length === 0 ? (
            <div className="text-[10px] text-gray-500">No recent activity</div>
          ) : (
            activities.slice(0, 2).map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3">
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                    activity.type === "payment" && "bg-green-100",
                    activity.type === "call" &&
                      activity.status === "missed" &&
                      "bg-red-100",
                    activity.type === "call" &&
                      activity.status !== "missed" &&
                      "bg-blue-100",
                    activity.type === "message" &&
                      activity.title === "Message sent" &&
                      "bg-blue-100",
                    activity.type === "message" &&
                      activity.title === "Message received" &&
                      "bg-gray-100",
                    activity.type === "message" &&
                      activity.title === "AI message sent" &&
                      "bg-purple-100"
                  )}
                >
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      activity.type === "payment" && "bg-green-500",
                      activity.type === "call" &&
                        activity.status === "missed" &&
                        "bg-red-500",
                      activity.type === "call" &&
                        activity.status !== "missed" &&
                        "bg-blue-500",
                      activity.type === "message" &&
                        activity.title === "Message sent" &&
                        "bg-blue-500",
                      activity.type === "message" &&
                        activity.title === "Message received" &&
                        "bg-gray-500",
                      activity.type === "message" &&
                        activity.title === "AI message sent" &&
                        "bg-purple-500"
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-gray-900 truncate">
                    {activity.title}
                  </p>
                  {activity.description && (
                    <p className="text-[10px] text-gray-600 truncate">
                      {activity.description}
                    </p>
                  )}
                  {activity.type === "message" && activity.content && (
                    <p className="text-[10px] text-gray-600 truncate">
                      {activity.content}
                    </p>
                  )}
                  <p className="text-[10px] text-gray-500">
                    {activity.timestamp} ago
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white sticky top-[49px] z-10">
        <button
          onClick={() => setActiveTab("details")}
          className={cn(
            "flex-1 py-2 text-[10px] font-medium transition-colors",
            activeTab === "details"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          Details
        </button>
        <button
          onClick={() => setActiveTab("activity")}
          className={cn(
            "flex-1 py-2 text-[10px] font-medium transition-colors",
            activeTab === "activity"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          Activity
        </button>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {activeTab === "details" && (
          <div className="space-y-3">
            {/* Status */}
            <div>
              <label className="block text-[10px] font-medium text-gray-700 mb-1">
                STATUS
              </label>
              <div className="relative">
                <button
                  onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                  className="w-full flex items-center justify-between px-2 py-1 border border-gray-300 rounded-lg bg-white text-left transition-colors hover:bg-gray-50"
                >
                  <span className="text-[10px] text-gray-900">
                    {customer.status}
                  </span>
                  <ChevronDown size={12} className="text-gray-500" />
                </button>
                {statusDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20">
                    {statusOptions.map((status) => (
                      <button
                        key={status}
                        className="w-full px-2 py-1 text-[10px] text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                        onClick={() => {
                          setStatusDropdownOpen(false);
                        }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-2">
              <div>
                <label className="block text-[10px] font-medium text-gray-700 mb-1">
                  NAME
                </label>
                <p className="text-[10px] text-gray-900">{customer.name}</p>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-gray-700 mb-1">
                  PHONE
                </label>
                <p className="text-[10px] text-gray-900">{customer.phone}</p>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-gray-700 mb-1">
                  EMAIL
                </label>
                <p className="text-[10px] text-gray-900">{customer.email}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-4">
                <div className="text-[10px] text-gray-500">
                  Loading activities...
                </div>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-4">
                <div className="text-[10px] text-gray-500">
                  No activities found
                </div>
              </div>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="border-b border-gray-100 pb-3 last:border-b-0"
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center mt-1 flex-shrink-0",
                        activity.type === "payment" && "bg-green-100",
                        activity.type === "call" && "bg-blue-100",
                        activity.type === "message" && "bg-gray-100"
                      )}
                    >
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          activity.type === "payment" && "bg-green-500",
                          activity.type === "call" && "bg-blue-500",
                          activity.type === "message" && "bg-gray-500"
                        )}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-[10px] font-medium text-gray-900">
                        {activity.title}
                      </h4>
                      <p className="text-[9px] text-gray-500 mt-1">
                        {activity.timestamp} ago
                      </p>
                      {activity.amount && (
                        <p className="text-[9px] text-green-600 mt-1">
                          ${(activity.amount / 100).toFixed(2)}
                        </p>
                      )}
                      {activity.duration && (
                        <p className="text-[9px] text-blue-600 mt-1">
                          Duration: {Math.floor(activity.duration / 60)}m{" "}
                          {activity.duration % 60}s
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
