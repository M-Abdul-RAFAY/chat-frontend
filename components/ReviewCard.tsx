"use client";

import { useState } from "react";
import { Review, ReplyDraft, User } from "@/types/review";
import { Avatar } from "./Avatar";
import { StarRating } from "./StarRating";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ReviewCardProps {
  review: Review;
  invitedUsers?: User[];
  onReply?: (reviewId: string, replyText: string) => void;
  onShare?: (reviewId: string) => void;
  showInviteInfo?: boolean;
}

export function ReviewCard({ review, onReply }: ReviewCardProps) {
  const [replyDraft, setReplyDraft] = useState<ReplyDraft>({
    id: "",
    reviewId: review.id,
    text: "",
    isWriting: false,
  });

  const handleStartReply = () => {
    setReplyDraft((prev) => ({ ...prev, isWriting: true }));
  };

  const handleCancelReply = () => {
    setReplyDraft({ id: "", reviewId: review.id, text: "", isWriting: false });
  };

  const handleSendReply = () => {
    if (onReply && replyDraft.text.trim()) {
      onReply(review.id, replyDraft.text);
      setReplyDraft({
        id: "",
        reviewId: review.id,
        text: "",
        isWriting: false,
      });
    }
  };

  const timeAgo = review.isRecent
    ? "just now"
    : formatDistanceToNow(review.timestamp, { addSuffix: true });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar user={review.user} size="md" />
          <div>
            <h3 className="font-semibold text-gray-900">{review.user.name}</h3>
            <p className="text-sm text-gray-500">
              Left a review {timeAgo} on{" "}
              <span className="text-blue-600 hover:underline cursor-pointer">
                {review.platform}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Rating */}
      <StarRating rating={review.rating} className="mb-4" />

      {/* Review Text */}
      <p className="text-gray-700 mb-4 leading-relaxed">{review.text}</p>

      {/* Reply Section */}
      {replyDraft.isWriting ? (
        <div className="border-t pt-4">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <textarea
                value={replyDraft.text}
                onChange={(e) =>
                  setReplyDraft((prev) => ({ ...prev, text: e.target.value }))
                }
                placeholder="Write your reply..."
                className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                autoFocus
              />
              <div className="flex items-center justify-end gap-2 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSendReply}
                  disabled={!replyDraft.text.trim()}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Send
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelReply}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-600">Thanks so much</div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleStartReply}>
              <MessageSquare className="w-4 h-4 mr-1" />
              Reply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
