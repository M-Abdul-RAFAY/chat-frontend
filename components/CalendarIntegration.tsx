import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface Meeting {
  _id: string;
  googleEventId: string;
  meetingDate: string;
  meetingTime: string;
  duration: number;
  title: string;
  description?: string;
  location?: string;
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  createdAt: string;
}

interface CalendarIntegrationProps {
  userId: string;
  customerId?: string;
}

export default function CalendarIntegration({
  userId,
  customerId,
}: CalendarIntegrationProps) {
  const { getToken } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [showMeetings, setShowMeetings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkCalendarStatus();
    if (customerId) {
      fetchCustomerMeetings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, customerId]);

  const checkCalendarStatus = async () => {
    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/calendar/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setIsConnected(data.isConnected);
    } catch (error) {
      console.error("Error checking calendar status:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerMeetings = async () => {
    if (!customerId) return;

    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/calendar/customers/${customerId}/meetings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setMeetings(data.meetings);
      }
    } catch (error) {
      console.error("Error fetching meetings:", error);
    }
  };

  const handleConnectCalendar = async () => {
    setError(null);
    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/calendar/auth/google`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Auth response:", data);

      if (data.success && data.authUrl) {
        // Open Google OAuth in a new window
        window.open(data.authUrl, "_blank", "width=600,height=700");

        // Poll for connection status
        const pollInterval = setInterval(async () => {
          await checkCalendarStatus();
          if (isConnected) {
            clearInterval(pollInterval);
          }
        }, 2000);
      } else {
        throw new Error(data.message || "Failed to get authorization URL");
      }
    } catch (error) {
      console.error("Error connecting calendar:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to connect Google Calendar"
      );
    }
  };

  const handleDisconnectCalendar = async () => {
    setError(null);
    setLoading(true);
    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/calendar/disconnect`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to disconnect");
      }

      const data = await response.json();
      console.log("Disconnect response:", data);

      if (data.success) {
        setIsConnected(false);
        setMeetings([]);
        // Force refresh the status to confirm
        await checkCalendarStatus();
      } else {
        throw new Error(data.message || "Failed to disconnect calendar");
      }
    } catch (error) {
      console.error("Error disconnecting calendar:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to disconnect Google Calendar"
      );
    } finally {
      setLoading(false);
    }
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "rescheduled":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Calendar Connection Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-blue-500" />
            <div>
              <h3 className="text-lg font-semibold">Google Calendar</h3>
              <p className="text-sm text-gray-600">
                {isConnected ? "Connected" : "Not connected"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <button
                  onClick={handleDisconnectCalendar}
                  className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={handleConnectCalendar}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Connect Calendar
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>

      {/* Scheduled Meetings */}
      {isConnected && customerId && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Scheduled Meetings</h3>
            <button
              onClick={() => setShowMeetings(!showMeetings)}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              {showMeetings ? "Hide" : "Show"} ({meetings.length})
            </button>
          </div>

          {showMeetings && (
            <div className="space-y-3">
              {meetings.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No meetings scheduled yet
                </p>
              ) : (
                meetings.map((meeting) => (
                  <div
                    key={meeting._id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {meeting.title}
                        </h4>
                        {meeting.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {meeting.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(meeting.meetingDate)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {meeting.meetingTime} ({meeting.duration} min)
                            </span>
                          </div>
                          {meeting.location && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{meeting.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(
                          meeting.status
                        )}`}
                      >
                        {meeting.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Meeting Detection Info */}
      {isConnected && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900">
                AI Meeting Detection Enabled
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                When customers mention scheduling a meeting in conversations,
                our AI will automatically detect it and create a Google Calendar
                event for you.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
