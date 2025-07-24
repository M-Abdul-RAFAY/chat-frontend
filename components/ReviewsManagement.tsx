"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, MessageSquare, Reply, Filter, Search } from "lucide-react";

// Simple toast implementation
const toast = {
  success: (message: string) => alert(`✅ ${message}`),
  error: (message: string) => alert(`❌ ${message}`),
};

interface Review {
  _id: string;
  businessId: string;
  platform: string;
  reviewId: string;
  rating: number;
  comment: string;
  authorName: string;
  authorPhoto?: string;
  createTime: string;
  updateTime?: string;
  response?: {
    comment: string;
    updateTime: string;
  };
  sentiment?: "positive" | "negative" | "neutral";
  status: "active" | "hidden" | "deleted";
  source: "api" | "manual";
}

interface Business {
  _id: string;
  name: string;
  platforms: {
    google?: {
      placeId: string;
      isConnected: boolean;
    };
  };
}

export default function ReviewsManagement() {
  const { getToken } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [replying, setReplying] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const fetchBusinesses = useCallback(async () => {
    try {
      const token = await getToken();
      const response = await fetch("/api/v1/business", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBusinesses(data.businesses);
        if (data.businesses.length > 0 && !selectedBusiness) {
          setSelectedBusiness(data.businesses[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching businesses:", error);
      toast.error("Failed to load businesses");
    }
  }, [getToken, selectedBusiness]);

  const fetchReviews = useCallback(async () => {
    if (!selectedBusiness) return;

    try {
      setLoading(true);
      const token = await getToken();
      const response = await fetch(
        `/api/v1/reviews/business/${selectedBusiness._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [getToken, selectedBusiness]);

  const replyToReview = async (reviewId: string, replyComment: string) => {
    try {
      const token = await getToken();
      const response = await fetch(`/api/v1/reviews/${reviewId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ comment: replyComment }),
      });

      if (response.ok) {
        toast.success("Reply posted successfully!");
        setReplying(null);
        setReplyText("");
        fetchReviews();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to post reply");
      }
    } catch (error) {
      console.error("Error posting reply:", error);
      toast.error("Failed to post reply");
    }
  };

  const generateAIResponse = async (reviewId: string) => {
    try {
      const token = await getToken();
      const response = await fetch(`/api/v1/reviews/${reviewId}/ai-response`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReplyText(data.response);
        toast.success("AI response generated!");
      } else {
        toast.error("Failed to generate AI response");
      }
    } catch (error) {
      console.error("Error generating AI response:", error);
      toast.error("Failed to generate AI response");
    }
  };

  const syncReviews = async () => {
    if (!selectedBusiness) return;

    try {
      const token = await getToken();
      const response = await fetch("/api/v1/reviews/sync/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ businessId: selectedBusiness._id }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(
          `Sync completed! ${data.result?.syncedReviews || 0} reviews processed`
        );
        fetchReviews();
      } else {
        const error = await response.json();
        toast.error(error.message || "Sync failed");
      }
    } catch (error) {
      console.error("Error syncing reviews:", error);
      toast.error("Failed to sync reviews");
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  useEffect(() => {
    if (selectedBusiness) {
      fetchReviews();
    }
  }, [selectedBusiness, fetchReviews]);

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.authorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating =
      ratingFilter === "all" || review.rating.toString() === ratingFilter;
    const matchesPlatform =
      platformFilter === "all" || review.platform === platformFilter;
    const matchesSentiment =
      sentimentFilter === "all" || review.sentiment === sentimentFilter;

    let matchesDate = true;
    if (dateFilter !== "all") {
      const reviewDate = new Date(review.createTime);
      const now = new Date();
      switch (dateFilter) {
        case "7d":
          matchesDate =
            now.getTime() - reviewDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
          break;
        case "30d":
          matchesDate =
            now.getTime() - reviewDate.getTime() <= 30 * 24 * 60 * 60 * 1000;
          break;
        case "90d":
          matchesDate =
            now.getTime() - reviewDate.getTime() <= 90 * 24 * 60 * 60 * 1000;
          break;
      }
    }

    return (
      matchesSearch &&
      matchesRating &&
      matchesPlatform &&
      matchesSentiment &&
      matchesDate
    );
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800";
      case "negative":
        return "bg-red-100 text-red-800";
      case "neutral":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reviews Management</h1>
          <p className="text-gray-600">
            Monitor and respond to customer reviews
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Select
            value={selectedBusiness?._id || ""}
            onValueChange={(value) => {
              const business = businesses.find((b) => b._id === value);
              setSelectedBusiness(business || null);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Business" />
            </SelectTrigger>
            <SelectContent>
              {businesses.map((business) => (
                <SelectItem key={business._id} value={business._id}>
                  {business.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={syncReviews} disabled={!selectedBusiness}>
            Sync Reviews
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>

            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="yelp">Yelp</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Sentiment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sentiments</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">Loading reviews...</div>
            </CardContent>
          </Card>
        ) : filteredReviews.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                No reviews found. Try adjusting your filters or sync reviews
                from your platforms.
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredReviews.map((review) => (
            <Card key={review._id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          {review.authorPhoto ? (
                            <div
                              className="w-full h-full rounded-full bg-cover bg-center"
                              style={{
                                backgroundImage: `url(${review.authorPhoto})`,
                              }}
                            />
                          ) : (
                            <span className="text-sm font-medium">
                              {review.authorName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{review.authorName}</div>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {renderStars(review.rating)}
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.createTime).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {review.platform}
                        </Badge>
                        {review.sentiment && (
                          <Badge
                            className={getSentimentColor(review.sentiment)}
                          >
                            {review.sentiment}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{review.comment}</p>

                    {/* Existing Response */}
                    {review.response && (
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Reply className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-800">
                            Business Response
                          </span>
                          <span className="text-sm text-blue-600">
                            {new Date(
                              review.response.updateTime
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-blue-700">
                          {review.response.comment}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:w-48">
                    {!review.response && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setReplying(review._id)}
                          className="w-full"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Reply
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateAIResponse(review._id)}
                          className="w-full"
                        >
                          AI Response
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Reply Form */}
                {replying === review._id && (
                  <div className="mt-4 p-4 border-t">
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Write your response..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => replyToReview(review._id, replyText)}
                          disabled={!replyText.trim()}
                        >
                          Post Reply
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setReplying(null);
                            setReplyText("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
