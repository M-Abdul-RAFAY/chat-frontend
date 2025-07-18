"use client";

import { useState, useMemo } from "react";
import { Review, User } from "@/types/review";
import { ReviewCard } from "./ReviewCard";
import { ReviewsFilter } from "./ReviewsFilter";
import { Button } from "@/components/ui/button";
import { Mail, Plus } from "lucide-react";

interface ReviewsDashboardProps {
  reviews: Review[];
  invitedUsers: User[];
}

export function ReviewsDashboard({
  reviews,
  invitedUsers,
}: ReviewsDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    reviews: "All reviews",
    site: "Any site",
    rating: "With any rating",
    time: "Anytime",
  });

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

      // Site filter
      if (filters.site !== "Any site" && review.platform !== filters.site) {
        return false;
      }

      // Rating filter
      if (filters.rating === "5 stars" && review.rating !== 5) {
        return false;
      }
      if (filters.rating === "4+ stars" && review.rating < 4) {
        return false;
      }

      // Time filter
      if (filters.time === "Last week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        if (review.timestamp < weekAgo) {
          return false;
        }
      }

      return true;
    });
  }, [reviews, searchTerm, filters]);

  const handleReply = (reviewId: string, replyText: string) => {
    console.log("Replying to review:", reviewId, "with:", replyText);
    // This would typically send the reply to your backend
  };

  const handleShare = (reviewId: string) => {
    console.log("Sharing review:", reviewId);
    // This would typically open a share dialog or copy link
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4 sm:mb-0">
          Reviews
        </h1>
      </div>

      {/* Filters */}
      <ReviewsFilter
        onSearchChange={setSearchTerm}
        onFilterChange={setFilters}
      />

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No reviews found matching your criteria.
            </p>
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
    </div>
  );
}
