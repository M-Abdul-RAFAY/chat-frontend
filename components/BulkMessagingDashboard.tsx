"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  MessageSquare,
  Plus,
  List,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import BulkMessageModal from "@/components/BulkMessageModal";
import Table from "@/components/Table";
import AllBulkMessagesPage from "@/components/AllBulkMessagesPage";
import { bulkMessageAPI, BulkMessage } from "@/lib/api";
import { useSocket } from "@/hooks/useSocket";

const faqItems = [
  {
    question: "What are bulk messages?",
    answer:
      "Bulk messages are a way to send the same message to multiple contacts at once. They're perfect for announcements, promotions, reminders, and other communications that need to reach your entire audience or specific segments.",
  },
  {
    question: "What are marketing messages?",
    answer:
      "Marketing messages are promotional communications sent to contacts who have opted in to receive marketing content. These include sales announcements, special offers, product updates, and other promotional materials.",
  },
  {
    question: "How do I grow my marketing list?",
    answer:
      "You can grow your marketing list by using sign-up tools, creating opt-in forms on your website, offering incentives for subscriptions, running social media campaigns, and ensuring you provide valuable content that encourages people to subscribe.",
  },
  {
    question: "Get support",
    answer:
      "Need help? Contact our support team through the help center, submit a ticket, or reach out via live chat. We're here to help you make the most of your bulk messaging campaigns and answer any questions you might have.",
  },
];

export default function BulkMessagingDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [bulkMessages, setBulkMessages] = useState<BulkMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<"dashboard" | "all-messages">(
    "dashboard"
  );
  const { socket } = useSocket();

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const fetchBulkMessages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await bulkMessageAPI.getRecentBulkMessages();
      setBulkMessages(response.data);
    } catch (err) {
      console.error("Error fetching bulk messages:", err);
      setError("Failed to load bulk messages. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBulkMessages();
  }, []);

  // Socket listener for real-time bulk message updates
  useEffect(() => {
    if (socket) {
      const handleBulkMessageUpdate = (data: {
        bulkMessageId: string;
        status: string;
        sentCount: number;
        failedCount: number;
        totalCount: number;
      }) => {
        setBulkMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === data.bulkMessageId
              ? {
                  ...msg,
                  status: data.status as
                    | "pending"
                    | "in_progress"
                    | "completed"
                    | "failed",
                  sentCount: data.sentCount,
                  failedCount: data.failedCount,
                  totalCount: data.totalCount,
                }
              : msg
          )
        );
      };

      const handleBulkMessageCreated = (data: { bulkMessage: BulkMessage }) => {
        setBulkMessages((prevMessages) => [data.bulkMessage, ...prevMessages]);
      };

      socket.on("bulkMessageUpdated", handleBulkMessageUpdate);
      socket.on("bulkMessageCreated", handleBulkMessageCreated);

      return () => {
        socket.off("bulkMessageUpdated", handleBulkMessageUpdate);
        socket.off("bulkMessageCreated", handleBulkMessageCreated);
      };
    }
  }, [socket]);

  const handleModalSuccess = () => {
    fetchBulkMessages(); // Refresh the list
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
      <div className="flex min-h-screen">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:min-h-screen
          ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
        >
          <div className="p-4 lg:p-6 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Bulk Messages
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden p-1"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <nav className="space-y-2">
              <Button
                variant={currentView === "dashboard" ? "secondary" : "ghost"}
                className={`w-full justify-start text-sm ${
                  currentView === "dashboard"
                    ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setCurrentView("dashboard")}
              >
                <Activity className="mr-2 h-4 w-4" />
                Activity
              </Button>
              <Button
                variant={currentView === "all-messages" ? "secondary" : "ghost"}
                className={`w-full justify-start text-sm ${
                  currentView === "all-messages"
                    ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setCurrentView("all-messages")}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                All Bulk Messages
              </Button>
            </nav>

            <Separator className="my-6" />

            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                AUDIENCE
              </h3>
              <nav className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-600 hover:text-gray-900 text-sm"
                >
                  <List className="mr-2 h-4 w-4" />
                  Marketing List
                </Button>
              </nav>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Toggle */}
        <div className="lg:hidden fixed top-4 left-4 z-30">
          <Button
            variant="outline"
            size="sm"
            className="p-2"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Main Content */}
        <main className="flex-1 w-full min-w-0">
          <div className="p-4 lg:p-6 pt-16 lg:pt-6">
            <div className="max-w-7xl mx-auto">
              {currentView === "dashboard" ? (
                <div className="flex flex-col xl:flex-row gap-4 lg:gap-6">
                  {/* Activity Section */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 lg:mb-6 gap-3">
                      <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                        Activity
                      </h1>
                      <Button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-sm lg:text-base"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create bulk message
                      </Button>
                    </div>

                    <Card>
                      <CardHeader className="pb-4">
                        <CardTitle className="text-base lg:text-lg">
                          Recent Bulk Messages
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 lg:px-6">
                        {isLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                            <span className="ml-2 text-sm text-gray-600">
                              Loading bulk messages...
                            </span>
                          </div>
                        ) : error ? (
                          <div className="flex items-center justify-center py-8">
                            <AlertCircle className="h-6 w-6 text-red-500" />
                            <span className="ml-2 text-sm text-red-600">
                              {error}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={fetchBulkMessages}
                              className="ml-2"
                            >
                              Retry
                            </Button>
                          </div>
                        ) : bulkMessages.length === 0 ? (
                          <div className="text-center py-8">
                            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 mb-4">
                              No campaigns have been created yet
                            </p>
                            <Button
                              onClick={() => setIsModalOpen(true)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Create Your First Campaign
                            </Button>
                          </div>
                        ) : (
                          <Table
                            bulkMessages={bulkMessages}
                            onViewAll={() => {
                              // TODO: Navigate to all bulk messages page
                              console.log("View all bulk messages");
                            }}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* FAQ Section */}
                  <div className="w-full xl:w-80 flex-shrink-0">
                    <Card>
                      <CardHeader className="pb-4">
                        <CardTitle className="text-base lg:text-lg">
                          FAQs
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 lg:px-6">
                        <div className="space-y-2">
                          {faqItems.map((item, index) => (
                            <div
                              key={index}
                              className="border border-gray-100 rounded-lg"
                            >
                              <Button
                                variant="ghost"
                                className="w-full justify-between text-left p-3 h-auto text-xs lg:text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                                onClick={() => toggleFaq(index)}
                              >
                                <span className="text-left pr-2">
                                  {item.question}
                                </span>
                                {expandedFaq === index ? (
                                  <ChevronDown className="h-4 w-4 flex-shrink-0" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 flex-shrink-0" />
                                )}
                              </Button>
                              {expandedFaq === index && (
                                <div className="px-3 pb-3">
                                  <p className="text-xs lg:text-sm text-gray-600 leading-relaxed">
                                    {item.answer}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <AllBulkMessagesPage
                  onBack={() => setCurrentView("dashboard")}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal */}
      <BulkMessageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
