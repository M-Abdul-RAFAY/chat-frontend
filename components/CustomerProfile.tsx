"use client";

import {
  X,
  MessageSquare,
  Phone,
  Mail,
  FileText,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CustomerProfileProps {
  conversationId: string;
  onClose: () => void;
}

interface ActivityItem {
  id: string;
  type: "feedback" | "payment" | "call";
  title: string;
  timestamp: string;
  status?: "completed" | "received" | "missed";
}

export default function CustomerProfile({
  conversationId,
  onClose,
}: CustomerProfileProps) {
  const [activeTab, setActiveTab] = useState<"details" | "activity">("details");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const customer = {
    name: "Will Pantente",
    phone: "(555) 555-5555",
    email: "will@email.com",
    status: "New",
    cardOnFile: {
      type: "Visa",
      number: "**** 1234",
      expires: "12/26",
    },
    tags: [],
  };

  const recentActivity: ActivityItem[] = [
    {
      id: "1",
      type: "feedback",
      title: "Completed Feedback Survey",
      timestamp: "59m",
      status: "completed",
    },
    {
      id: "2",
      type: "payment",
      title: "$149.00 payment received",
      timestamp: "2d",
      status: "received",
    },
    {
      id: "3",
      type: "call",
      title: "Missed call",
      timestamp: "3d",
      status: "missed",
    },
  ];

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
          <div className="w-7 h-7 bg-pink-500 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0 text-[11px]">
            WP
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-gray-900 truncate text-[12px]">
              {customer.name}
            </h2>
            <p className="text-[11px] text-gray-500 truncate">
              {customer.phone}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-gray-500 hover:bg-gray-100 rounded-full transition-colors hidden md:block"
        >
          <X size={14} />
        </button>
      </div>

      {/* Profile Image Section */}
      <div className="px-2 py-3 text-center border-b border-gray-200 bg-gray-50">
        <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold text-[14px] mx-auto mb-2">
          WP
        </div>
        <h3 className="text-[12px] font-semibold text-gray-900 mb-1">
          {customer.name}
        </h3>
        <p className="text-[11px] text-gray-500">{customer.phone}</p>
      </div>

      {/* Action Buttons */}
      <div className="px-3 py-3 border-b border-gray-200 bg-white">
        <div className="grid grid-cols-4 gap-3">
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
          <button className="flex flex-col items-center p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <FileText size={16} className="mb-1" />
            <span className="text-[10px]">Files</span>
          </button>
        </div>
      </div>

      {/* Recent Activity Preview */}
      <div className="px-3 py-3 border-b border-gray-200 bg-white">
        <h3 className="text-[11px] font-medium text-gray-900 mb-2">
          RECENT ACTIVITY
        </h3>
        <div className="space-y-3">
          {recentActivity.slice(0, 2).map((activity) => (
            <div key={activity.id} className="flex items-center space-x-3">
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                  activity.type === "feedback" &&
                    activity.status === "completed" &&
                    "bg-pink-100",
                  activity.type === "payment" &&
                    activity.status === "received" &&
                    "bg-green-100",
                  activity.type === "call" &&
                    activity.status === "missed" &&
                    "bg-red-100"
                )}
              >
                {activity.type === "feedback" && (
                  <div className="w-2 h-2 bg-pink-500 rounded-full" />
                )}
                {activity.type === "payment" && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                )}
                {activity.type === "call" && (
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-gray-900 truncate">
                  {activity.title}
                </p>
                <p className="text-[10px] text-gray-500">
                  {activity.timestamp} ago
                </p>
              </div>
            </div>
          ))}
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

            {/* Card on File */}
            <div>
              <label className="block text-[10px] font-medium text-gray-700 mb-1">
                CARD ON FILE
              </label>
              <div className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg">
                <div className="w-6 h-5 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-[9px] text-white font-bold">V</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-900">
                    {customer.cardOnFile.type} {customer.cardOnFile.number}
                  </p>
                  <p className="text-[9px] text-gray-500">
                    Expires {customer.cardOnFile.expires}
                  </p>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-[10px] font-medium text-gray-700 mb-1">
                TAGS
              </label>
              <p className="text-[10px] text-gray-500">No tags added</p>
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="border-b border-gray-100 pb-3 last:border-b-0"
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center mt-1 flex-shrink-0",
                      activity.type === "feedback" && "bg-pink-100",
                      activity.type === "payment" && "bg-green-100",
                      activity.type === "call" && "bg-red-100"
                    )}
                  >
                    {activity.type === "feedback" && (
                      <div className="w-2 h-2 bg-pink-500 rounded-full" />
                    )}
                    {activity.type === "payment" && (
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                    )}
                    {activity.type === "call" && (
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[10px] font-medium text-gray-900">
                      {activity.title}
                    </h4>
                    <p className="text-[9px] text-gray-500 mt-1">
                      {activity.timestamp} ago
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
