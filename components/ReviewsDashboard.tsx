"use client";

import { useState, useMemo } from "react";
import { User } from "@/types/review";
import { ReviewCard } from "./ReviewCard";
import { ReviewsFilter } from "./ReviewsFilter";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { useReviews } from "@/hooks/useReviews";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "./Toast";
import { GoogleBusinessProfileAuth } from "./GoogleBusinessProfileAuth";

interface ReviewsDashboardProps {
  invitedUsers?: User[];
}

export function ReviewsDashboard({ invitedUsers = [] }: ReviewsDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    reviews: "All reviews",
    site: "Any site",
    rating: "With any rating",
    time: "Anytime",
  });

  const { showToast, toasts, hideToast } = useToast();

  // Convert filters to API format
  const apiFilters = useMemo(() => {
    const result: Record<string, string | number> = { limit: 50 };

    if (filters.reviews === "Unanswered") result.status = "new";
    if (filters.reviews === "Answered") result.status = "replied";

    if (filters.site !== "Any site") result.platform = filters.site;

    if (filters.rating === "5 stars") result.rating = 5;
    if (filters.rating === "4+ stars") result.rating = 4; // This will need backend adjustment for >=4

    return result;
  }, [filters]);

  const {
    reviews,
    stats,
    loading,
    error,
    replyToReview,
    syncReviews,
    refetch,
  } = useReviews(apiFilters);

  const [isSyncing, setIsSyncing] = useState(false);
  const [googleToken, setGoogleToken] = useState<string | null>(null);

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      // Search filter
      if (
        searchTerm &&
        !review.text.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !review.user.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Time filter (additional client-side filtering)
      if (filters.time === "Last week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        if (review.timestamp < weekAgo) {
          return false;
        }
      }

      return true;
    });
  }, [reviews, searchTerm, filters.time]);

  const handleReply = async (reviewId: string, replyText: string) => {
    try {
      await replyToReview(reviewId, replyText);
      showToast({
        type: "success",
        title: "Reply posted successfully",
        message: "Your reply has been posted to the review.",
      });
    } catch (error) {
      console.error("Failed to reply to review:", error);
      showToast({
        type: "error",
        title: "Failed to post reply",
        message:
          error instanceof Error
            ? error.message
            : "An error occurred while posting your reply.",
      });
    }
  };

  const handleShare = (reviewId: string) => {
    console.log("Sharing review:", reviewId);
    showToast({
      type: "info",
      title: "Share functionality",
      message: "Review sharing feature coming soon!",
    });
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncReviews(googleToken || undefined);
      showToast({
        type: "success",
        title: "Reviews synced",
        message: "Successfully synced reviews from Google Business Profile.",
      });
    } catch (error) {
      console.error("Failed to sync reviews:", error);
      showToast({
        type: "error",
        title: "Sync failed",
        message:
          error instanceof Error
            ? error.message
            : "Failed to sync reviews. Please try again.",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">Error loading reviews: {error}</p>
          <Button onClick={refetch} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Reviews</h1>
          {stats && (
            <div className="flex gap-4 text-sm text-gray-600">
              <span>Total: {stats.overall.total}</span>
              <span>Average: {stats.overall.averageRating.toFixed(1)}★</span>
              <span>Response Rate: {stats.overall.responseRate}%</span>
              {stats.overall.newReviews > 0 && (
                <span className="text-orange-600 font-medium">
                  {stats.overall.newReviews} new
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
          {!googleToken && (
            <GoogleBusinessProfileAuth 
              onTokenReceived={setGoogleToken}
            />
          )}
          <Button
            onClick={handleSync}
            disabled={isSyncing}
            variant="outline"
          >
            {isSyncing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Reviews
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <ReviewsFilter
        onSearchChange={setSearchTerm}
        onFilterChange={setFilters}
      />

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      )}

      {/* Reviews List */}
      {!loading && (
        <div className="space-y-4">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                {reviews.length === 0
                  ? "No reviews found. Connect your Google Business Profile to import reviews."
                  : "No reviews found matching your criteria."}
              </p>
              {reviews.length === 0 && (
                <div className="space-y-4">
                  {!googleToken ? (
                    <GoogleBusinessProfileAuth 
                      onTokenReceived={setGoogleToken}
                      className="flex justify-center"
                    />
                  ) : (
                    <Button onClick={handleSync} disabled={isSyncing}>
                      {isSyncing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Sync Reviews
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
          ) : (
            filteredReviews.map((review, index) => (
              <ReviewCard
                key={review.id}
                review={review}
                invitedUsers={index === 0 ? invitedUsers : []} // Show invite info only for first review
                onReply={handleReply}
                onShare={handleShare}
                showInviteInfo={index === 0}
              />
            ))
          )}
        </div>
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={hideToast} />
    </div>
  );
}
