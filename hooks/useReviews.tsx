import { useState, useEffect, useCallback } from "react";
import { Review, ReviewStatus } from "@/types/review";
import { getAuthHeaders } from "@/lib/api";

interface ReviewStats {
  overall: {
    total: number;
    averageRating: number;
    responseRate: number;
    newReviews: number;
    ratingDistribution: Record<number, number>;
  };
  recent: {
    total: number;
    averageRating: number;
    newReviews: number;
  };
  platforms: Record<
    string,
    {
      count: number;
      averageRating: number;
    }
  >;
  timestamp: string;
}

interface UseReviewsReturn {
  reviews: Review[];
  stats: ReviewStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  replyToReview: (reviewId: string, replyText: string) => Promise<void>;
  syncReviews: (googleToken?: string) => Promise<void>;
  updateReviewStatus: (reviewId: string, status: ReviewStatus) => Promise<void>;
}

interface UseReviewsFilters {
  page?: number;
  limit?: number;
  status?: string;
  platform?: string;
  rating?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Backend review interface
interface BackendReview {
  _id: string;
  rating: number;
  comment: string;
  reviewTimestamp: string;
  platform: string;
  reviewerName: string;
  reviewerProfilePhotoUrl?: string;
  replyText?: string;
  replyTimestamp?: string;
  status: ReviewStatus;
  isRecent?: boolean;
}

declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken: () => Promise<string> | string;
      };
    };
  }
}

export function useReviews(filters: UseReviewsFilters = {}): UseReviewsReturn {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use the same API base URL as other parts of the app
  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (filters.page) queryParams.append("page", filters.page.toString());
      if (filters.limit) queryParams.append("limit", filters.limit.toString());
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.platform) queryParams.append("platform", filters.platform);
      if (filters.rating)
        queryParams.append("rating", filters.rating.toString());
      if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);
      if (filters.sortOrder) queryParams.append("sortOrder", filters.sortOrder);

      const url = `${API_BASE}/reviews?${queryParams.toString()}`;

      const response = await fetch(url, {
        headers: await getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch reviews: ${response.statusText}`);
      }

      const data = await response.json();

      // Transform backend data to frontend format
      const transformedReviews: Review[] = data.reviews.map(
        (review: BackendReview) => ({
          id: review._id,
          rating: review.rating,
          text: review.comment,
          timestamp: new Date(review.reviewTimestamp),
          platform: review.platform,
          user: {
            name: review.reviewerName,
            avatar: review.reviewerProfilePhotoUrl || "",
            initials: review.reviewerName
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2),
            bgColor: `bg-${
              ["blue", "green", "purple", "orange", "pink"][
                Math.floor(Math.random() * 5)
              ]
            }-500`,
          },
          location: {
            name: "Business Location", // This could be populated from GBP location data
            address: "",
          },
          replyText: review.replyText || "",
          replyTimestamp: review.replyTimestamp
            ? new Date(review.replyTimestamp)
            : null,
          status: review.status,
          isRecent: review.isRecent || false,
        })
      );

      setReviews(transformedReviews);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [API_BASE, filters]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/reviews/stats/summary`, {
        headers: await getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`);
      }

      const statsData = await response.json();
      setStats(statsData);
    } catch (err) {
      console.error("Error fetching stats:", err);
      // Don't set error state for stats failure, just log it
    }
  }, [API_BASE]);

  const replyToReview = async (reviewId: string, replyText: string) => {
    try {
      const response = await fetch(`${API_BASE}/reviews/${reviewId}/reply`, {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify({ replyText }),
      });

      if (!response.ok) {
        throw new Error(`Failed to reply to review: ${response.statusText}`);
      }

      // Refetch reviews to get updated data
      await fetchReviews();
    } catch (err) {
      console.error("Error replying to review:", err);
      throw err;
    }
  };

  const syncReviews = async (googleToken?: string) => {
    try {
      setLoading(true);

      const headers = await getAuthHeaders();
      if (googleToken) {
        headers["x-gbp-token"] = googleToken;
      }

      const response = await fetch(`${API_BASE}/reviews/sync`, {
        method: "POST",
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (errorData.error === "MISSING_GBP_TOKEN") {
          throw new Error(
            "Google Business Profile connection required. Please connect your Google Business Profile first."
          );
        }

        throw new Error(`Failed to sync reviews: ${response.statusText}`);
      }

      // Refetch reviews and stats after sync
      await Promise.all([fetchReviews(), fetchStats()]);
    } catch (err) {
      console.error("Error syncing reviews:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateReviewStatus = async (reviewId: string, status: ReviewStatus) => {
    try {
      const response = await fetch(`${API_BASE}/reviews/${reviewId}/status`, {
        method: "PUT",
        headers: await getAuthHeaders(),
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to update review status: ${response.statusText}`
        );
      }

      // Update local state
      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId ? { ...review, status } : review
        )
      );
    } catch (err) {
      console.error("Error updating review status:", err);
      throw err;
    }
  };

  const refetch = async () => {
    await Promise.all([fetchReviews(), fetchStats()]);
  };

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [fetchReviews, fetchStats]);

  return {
    reviews,
    stats,
    loading,
    error,
    refetch,
    replyToReview,
    syncReviews,
    updateReviewStatus,
  };
}
