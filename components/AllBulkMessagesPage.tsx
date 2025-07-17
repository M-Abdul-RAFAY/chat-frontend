"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Search,
  Download,
  Plus,
  Loader2,
  AlertCircle,
  Calendar,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Table from "@/components/Table";
import BulkMessageModal from "@/components/BulkMessageModal";
import { bulkMessageAPI, BulkMessage } from "@/lib/api";
import { useSocket } from "@/hooks/useSocket";

interface AllBulkMessagesPageProps {
  onBack?: () => void;
}

export default function AllBulkMessagesPage({
  onBack,
}: AllBulkMessagesPageProps) {
  const [bulkMessages, setBulkMessages] = useState<BulkMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<BulkMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const { socket } = useSocket();

  const itemsPerPage = 10;

  const fetchAllBulkMessages = async (page: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await bulkMessageAPI.getAllBulkMessages(
        page,
        itemsPerPage
      );
      setBulkMessages(response.data);
      setTotalPages(response.pagination?.pages || 1);
    } catch (err) {
      console.error("Error fetching bulk messages:", err);
      setError("Failed to load bulk messages. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBulkMessages(currentPage);
  }, [currentPage]);

  // Filter messages based on search and filters
  useEffect(() => {
    let filtered = bulkMessages;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (msg) =>
          msg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          msg.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((msg) => msg.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      let startDate = new Date();

      switch (dateFilter) {
        case "today":
          startDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate.setDate(now.getDate() - 30);
          break;
        default:
          startDate = new Date(0);
      }

      filtered = filtered.filter((msg) => new Date(msg.createdAt) >= startDate);
    }

    setFilteredMessages(filtered);
  }, [bulkMessages, searchTerm, statusFilter, dateFilter]);

  // Socket listener for real-time updates
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
    fetchAllBulkMessages(currentPage);
  };

  const getStatusStats = () => {
    const stats = {
      total: bulkMessages.length,
      completed: bulkMessages.filter((msg) => msg.status === "completed")
        .length,
      pending: bulkMessages.filter((msg) => msg.status === "pending").length,
      scheduled: bulkMessages.filter((msg) => msg.status === "scheduled")
        .length,
      failed: bulkMessages.filter((msg) => msg.status === "failed").length,
    };
    return stats;
  };

  const stats = getStatusStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  All Bulk Messages
                </h1>
                <p className="text-gray-600">
                  Manage and track all your bulk messaging campaigns
                </p>
              </div>
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Campaign
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.completed}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {stats.pending}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Scheduled</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.scheduled}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-600">Failed</p>
                    <p className="text-2xl font-bold text-red-600">
                      {stats.failed}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Filter & Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search" className="text-sm font-medium">
                    Search
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by title or message..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status" className="text-sm font-medium">
                    Status
                  </Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date" className="text-sm font-medium">
                    Date Range
                  </Label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Last 7 days</SelectItem>
                      <SelectItem value="month">Last 30 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setDateFilter("all");
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Bulk Messages ({filteredMessages.length})
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">
                    Loading bulk messages...
                  </span>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-12">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                  <span className="ml-2 text-red-600">{error}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fetchAllBulkMessages(currentPage)}
                    className="ml-2"
                  >
                    Retry
                  </Button>
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">
                    {searchTerm ||
                    statusFilter !== "all" ||
                    dateFilter !== "all"
                      ? "No bulk messages match your filters"
                      : "No bulk messages have been created yet"}
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
                <div>
                  <Table bulkMessages={filteredMessages} />

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                      <div className="text-sm text-gray-600">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                        {Math.min(
                          currentPage * itemsPerPage,
                          filteredMessages.length
                        )}{" "}
                        of {filteredMessages.length} results
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage(Math.max(1, currentPage - 1))
                          }
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1
                          ).map((page) => (
                            <Button
                              key={page}
                              variant={
                                currentPage === page ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className="w-8 h-8 p-0"
                            >
                              {page}
                            </Button>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage(
                              Math.min(totalPages, currentPage + 1)
                            )
                          }
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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
