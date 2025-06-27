"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  MessageSquare,
  Users,
  Zap,
  MoreHorizontal,
  Plus,
  List,
  UserPlus,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import BulkMessageModal from "@/components/BulkMessageModal";

const bulkMessages = [
  {
    id: 1,
    title: "Free Delivery Promo",
    description:
      "Contact - how can you get free delivery all month long? It's easy, just join us at the showroom this...",
    status: "Scheduled",
    statusColor: "bg-orange-100 text-orange-800",
    activity: 46,
    activityType: "Messages",
    activityCount: 4662,
    date: "Scheduled for April 3, 2024",
    progress: null,
  },
  {
    id: 2,
    title: "Showroom Event",
    description:
      "Hey Contact, this is Venture Auto! We're excited about our upcoming showroom event...",
    status: "Completed",
    statusColor: "bg-green-100 text-green-800",
    activity: 40,
    activityType: "Click rate",
    activityCount: 5004,
    date: "Sent January 15, 2024",
    progress: 40,
  },
  {
    id: 3,
    title: "Mega Sale",
    description:
      "Contact - now's your chance to shop our biggest sale yet! On Friday, our entire showroom will...",
    status: "Completed",
    statusColor: "bg-green-100 text-green-800",
    activity: 42,
    activityType: "Click rate",
    activityCount: 4114,
    date: "Sent December 21, 2023",
    progress: 42,
  },
  {
    id: 4,
    title: "Holiday Shopping",
    description:
      "Hey, Contact! Venture Auto is ready to celebrate the holidays with a brand new ride for you and...",
    status: "Completed",
    statusColor: "bg-green-100 text-green-800",
    activity: 30,
    activityType: "Click rate",
    activityCount: 3032,
    date: "Sent December 15, 2023",
    progress: 30,
  },
];

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

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
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
                variant="secondary"
                className="w-full justify-start bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm"
              >
                <Activity className="mr-2 h-4 w-4" />
                Activity
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-600 hover:text-gray-900 text-sm"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                All Bulk Messages
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-600 hover:text-gray-900 text-sm"
              >
                <Zap className="mr-2 h-4 w-4" />
                Automations
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
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-600 hover:text-gray-900 text-sm"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign-Up Tools
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
                      <div className="space-y-4 lg:space-y-6">
                        {bulkMessages.map((message) => (
                          <div
                            key={message.id}
                            className="border-b border-gray-100 pb-4 lg:pb-6 last:border-b-0"
                          >
                            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                  <h3 className="font-medium text-gray-900 text-sm lg:text-base">
                                    {message.title}
                                  </h3>
                                  <Badge
                                    className={`${message.statusColor} text-xs w-fit`}
                                  >
                                    {message.status}
                                  </Badge>
                                </div>
                                <p className="text-xs lg:text-sm text-gray-600 mb-2 line-clamp-2">
                                  {message.description}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {message.date}
                                </p>
                                {message.progress && (
                                  <div className="mt-2">
                                    <Progress
                                      value={message.progress}
                                      className="h-2"
                                    />
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center justify-between lg:justify-end gap-3 lg:gap-4 lg:ml-4">
                                <div className="flex gap-3 lg:gap-4">
                                  <div className="text-center">
                                    <div className="text-base lg:text-lg font-semibold text-gray-900">
                                      {message.activity}%
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {message.activityType}
                                    </div>
                                  </div>

                                  <div className="text-center">
                                    <div className="text-base lg:text-lg font-semibold text-gray-900">
                                      {message.activityCount.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      Messages
                                    </div>
                                  </div>
                                </div>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-1"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}

                        <div className="text-center pt-4">
                          <Button
                            variant="link"
                            className="text-blue-600 text-sm"
                          >
                            View all bulk messages
                          </Button>
                        </div>
                      </div>
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
            </div>
          </div>
        </main>
      </div>

      {/* Modal */}
      <BulkMessageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
