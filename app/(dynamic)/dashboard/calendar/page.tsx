"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import CalendarIntegration from "@/components/CalendarIntegration";
import { Calendar, Clock, MapPin, User, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface Meeting {
  _id: string;
  googleEventId: string;
  meetingDate: string;
  meetingTime?: string;
  duration: number;
  title: string;
  description?: string;
  location?: string;
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  createdAt: string;
  customerName?: string;
  customerPhone?: string;
}

export default function CalendarPage() {
  const { userId, getToken } = useAuth();
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchAllMeetings();
    }
  }, [userId]);

  const fetchAllMeetings = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/calendar/events`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch meetings");
      }

      const data = await response.json();
      if (data.success) {
        setMeetings(data.events || []);
      }
    } catch (err) {
      console.error("Error fetching meetings:", err);
      setError("Failed to load meetings");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "rescheduled":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const groupMeetingsByDate = (meetings: Meeting[]) => {
    const grouped: { [key: string]: Meeting[] } = {};

    meetings.forEach((meeting) => {
      const dateKey = new Date(meeting.meetingDate).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(meeting);
    });

    // Sort groups by date
    return Object.entries(grouped).sort(
      ([dateA], [dateB]) =>
        new Date(dateA).getTime() - new Date(dateB).getTime()
    );
  };

  const upcomingMeetings = meetings.filter(
    (m) => new Date(m.meetingDate) > new Date() && m.status === "scheduled"
  );
  const pastMeetings = meetings.filter(
    (m) => new Date(m.meetingDate) <= new Date() || m.status !== "scheduled"
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <Calendar className="w-7 h-7 text-blue-500" />
                  <span>Calendar & Meetings</span>
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Manage your scheduled meetings and calendar integration
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Calendar Integration */}
          <div className="lg:col-span-1">
            <CalendarIntegration userId={userId || ""} />
          </div>

          {/* Right Column - Meetings List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Meetings */}
            <div className="bg-white rounded-lg shadow">
              <div className="border-b px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span>Upcoming Meetings</span>
                  <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">
                    {upcomingMeetings.length}
                  </span>
                </h2>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-red-600">{error}</p>
                  </div>
                ) : upcomingMeetings.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No upcoming meetings</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Schedule meetings will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {groupMeetingsByDate(upcomingMeetings).map(
                      ([date, dateMeetings]) => (
                        <div key={date}>
                          <h3 className="text-sm font-semibold text-gray-700 mb-3 sticky top-0 bg-white py-2">
                            {formatDate(date)}
                          </h3>
                          <div className="space-y-3">
                            {dateMeetings.map((meeting) => (
                              <div
                                key={meeting._id}
                                className="border rounded-lg p-4 hover:shadow-md transition"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 mb-1">
                                      {meeting.title}
                                    </h4>
                                    {meeting.description && (
                                      <p className="text-sm text-gray-600 mb-3">
                                        {meeting.description}
                                      </p>
                                    )}
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                      <div className="flex items-center space-x-1">
                                        <Clock className="w-4 h-4" />
                                        <span>
                                          {meeting.meetingTime ||
                                            formatTime(
                                              meeting.meetingDate
                                            )}{" "}
                                          ({meeting.duration} min)
                                        </span>
                                      </div>
                                      {meeting.location && (
                                        <div className="flex items-center space-x-1">
                                          <MapPin className="w-4 h-4" />
                                          <span>{meeting.location}</span>
                                        </div>
                                      )}
                                      {(meeting.customerName ||
                                        meeting.customerPhone) && (
                                        <div className="flex items-center space-x-1">
                                          <User className="w-4 h-4" />
                                          <span>
                                            {meeting.customerName ||
                                              meeting.customerPhone}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <span
                                    className={`px-3 py-1 text-xs rounded-full font-medium border ${getStatusColor(
                                      meeting.status
                                    )}`}
                                  >
                                    {meeting.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Past Meetings */}
            {pastMeetings.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="border-b px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span>Past Meetings</span>
                    <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full font-medium">
                      {pastMeetings.length}
                    </span>
                  </h2>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {groupMeetingsByDate(pastMeetings)
                      .reverse()
                      .map(([date, dateMeetings]) => (
                        <div key={date}>
                          <h3 className="text-sm font-semibold text-gray-700 mb-3">
                            {formatDate(date)}
                          </h3>
                          <div className="space-y-3">
                            {dateMeetings.map((meeting) => (
                              <div
                                key={meeting._id}
                                className="border rounded-lg p-4 opacity-75 hover:opacity-100 transition"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 mb-1">
                                      {meeting.title}
                                    </h4>
                                    {meeting.description && (
                                      <p className="text-sm text-gray-600 mb-3">
                                        {meeting.description}
                                      </p>
                                    )}
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                      <div className="flex items-center space-x-1">
                                        <Clock className="w-4 h-4" />
                                        <span>
                                          {meeting.meetingTime ||
                                            formatTime(
                                              meeting.meetingDate
                                            )}{" "}
                                          ({meeting.duration} min)
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
                                    className={`px-3 py-1 text-xs rounded-full font-medium border ${getStatusColor(
                                      meeting.status
                                    )}`}
                                  >
                                    {meeting.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
