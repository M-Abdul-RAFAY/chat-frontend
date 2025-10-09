"use client";

import { useState, useEffect } from "react";
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  Clock,
  Calendar,
  PlayCircle,
  Download,
  FileText,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { callAPI, Call } from "@/lib/api";
import { showToast } from "@/lib/toast";

interface CallHistoryProps {
  conversationId?: string;
  customerId?: string;
  limit?: number;
}

export default function CallHistory({
  conversationId,
  customerId,
  limit = 20,
}: CallHistoryProps) {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);

  // Fetch call history
  useEffect(() => {
    fetchCallHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, customerId, limit]);

  const fetchCallHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await callAPI.getCallHistory({
        conversationId,
        customerId,
        limit,
      });

      if (response.success) {
        setCalls(response.calls);
      } else {
        throw new Error("Failed to fetch call history");
      }
    } catch (err) {
      console.error("Error fetching call history:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load call history"
      );
      showToast.error("Failed to load call history");
    } finally {
      setLoading(false);
    }
  };

  // Format duration as MM:SS
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  // Format time
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50";
      case "in-progress":
        return "text-blue-600 bg-blue-50";
      case "no-answer":
      case "busy":
        return "text-yellow-600 bg-yellow-50";
      case "failed":
      case "canceled":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  // Get status label
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in-progress":
        return "In Progress";
      case "no-answer":
        return "No Answer";
      case "busy":
        return "Busy";
      case "failed":
        return "Failed";
      case "canceled":
        return "Canceled";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
        <span className="ml-2 text-gray-600">Loading call history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={fetchCallHistory}
          className="mt-2 text-sm text-red-700 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Phone className="w-12 h-12 text-gray-300 mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          No call history
        </h3>
        <p className="text-sm text-gray-500">
          Call history will appear here once you make or receive calls
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Call History</h3>
        <button
          onClick={fetchCallHistory}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2">
        {calls.map((call) => (
          <div
            key={call._id}
            className={cn(
              "p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer",
              selectedCall?._id === call._id && "border-blue-500 bg-blue-50"
            )}
            onClick={() =>
              setSelectedCall(selectedCall?._id === call._id ? null : call)
            }
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {/* Call direction icon */}
                <div
                  className={cn(
                    "p-2 rounded-full",
                    call.direction === "outbound"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-green-100 text-green-600"
                  )}
                >
                  {call.direction === "outbound" ? (
                    <PhoneOutgoing className="w-4 h-4" />
                  ) : (
                    <PhoneIncoming className="w-4 h-4" />
                  )}
                </div>

                {/* Call details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 truncate">
                      {call.direction === "outbound" ? call.to : call.from}
                    </span>
                    <span
                      className={cn(
                        "px-2 py-0.5 text-xs font-medium rounded-full",
                        getStatusColor(call.status)
                      )}
                    >
                      {getStatusLabel(call.status)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(call.startedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(call.startedAt)}
                    </span>
                    {call.duration > 0 && (
                      <span className="font-medium text-gray-700">
                        {formatDuration(call.duration)}
                      </span>
                    )}
                  </div>

                  {/* Recording indicator */}
                  {call.recordingUrl && (
                    <div className="mt-2 flex items-center gap-2">
                      <PlayCircle className="w-4 h-4 text-purple-600" />
                      <span className="text-xs text-purple-600 font-medium">
                        Recording available
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Expanded details */}
            {selectedCall?._id === call._id && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">From:</span>
                    <p className="font-medium text-gray-900">{call.from}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">To:</span>
                    <p className="font-medium text-gray-900">{call.to}</p>
                  </div>
                  {call.answeredAt && (
                    <div>
                      <span className="text-gray-500">Answered:</span>
                      <p className="font-medium text-gray-900">
                        {formatTime(call.answeredAt)}
                      </p>
                    </div>
                  )}
                  {call.endedAt && (
                    <div>
                      <span className="text-gray-500">Ended:</span>
                      <p className="font-medium text-gray-900">
                        {formatTime(call.endedAt)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {call.notes && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div>
                        <span className="text-xs text-gray-500">Notes:</span>
                        <p className="text-sm text-gray-900 mt-1">
                          {call.notes}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recording */}
                {call.recordingUrl && (
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(call.recordingUrl, "_blank");
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                    >
                      <PlayCircle className="w-4 h-4" />
                      Play Recording
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (call.recordingUrl) {
                          const link = document.createElement("a");
                          link.href = call.recordingUrl;
                          link.download = `call-${call._id}.mp3`;
                          link.click();
                        }
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                )}

                {/* Twilio SID for debugging */}
                {call.twilioSid && (
                  <div className="text-xs text-gray-400">
                    ID: {call.twilioSid}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
