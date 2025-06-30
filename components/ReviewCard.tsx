'use client';

import { useState } from 'react';
import { Review, ReplyDraft, User } from '@/types/review';
import { Avatar } from './Avatar';
import { StarRating } from './StarRating';
import { Button } from '@/components/ui/button';
import { Share2, MessageSquare, Copy, Zap, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ReviewCardProps {
  review: Review;
  invitedUsers?: User[];
  onReply?: (reviewId: string, replyText: string) => void;
  onShare?: (reviewId: string) => void;
  showInviteInfo?: boolean;
}

export function ReviewCard({ 
  review, 
  invitedUsers = [], 
  onReply, 
  onShare,
  showInviteInfo = false 
}: ReviewCardProps) {
  const [replyDraft, setReplyDraft] = useState<ReplyDraft>({
    id: '',
    reviewId: review.id,
    text: '',
    isWriting: false
  });

  const handleStartReply = () => {
    setReplyDraft(prev => ({ ...prev, isWriting: true }));
  };

  const handleCancelReply = () => {
    setReplyDraft({ id: '', reviewId: review.id, text: '', isWriting: false });
  };

  const handleSendReply = () => {
    if (onReply && replyDraft.text.trim()) {
      onReply(review.id, replyDraft.text);
      setReplyDraft({ id: '', reviewId: review.id, text: '', isWriting: false });
    }
  };

  const timeAgo = review.isRecent 
    ? 'just now' 
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
              Left a review {timeAgo} on{' '}
              <span className="text-blue-600 hover:underline cursor-pointer">
                {review.platform}
              </span>
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => onShare?.(review.id)}>
          Share
        </Button>
      </div>

      {/* Rating */}
      <StarRating rating={review.rating} className="mb-4" />

      {/* Review Text */}
      <p className="text-gray-700 mb-4 leading-relaxed">{review.text}</p>

      {/* Invite Info */}
      {showInviteInfo && invitedUsers.length > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
          <Avatar user={invitedUsers[0]} size="sm" />
          <span className="text-sm text-gray-600">
            {invitedUsers[0].name} sent a review invite today
          </span>
          <div className="flex items-center gap-1 ml-auto">
            {invitedUsers.slice(1, 5).map((user, index) => (
              <Avatar key={user.id} user={user} size="sm" className="-ml-1" />
            ))}
            {invitedUsers.length > 4 && (
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs text-gray-600 -ml-1">
                +{invitedUsers.length - 4}
              </div>
            )}
            <Button variant="ghost" size="sm" className="ml-2">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Reply Section */}
      {replyDraft.isWriting ? (
        <div className="border-t pt-4">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-blue-600 mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-blue-600 font-medium">Writing...</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelReply}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </Button>
              </div>
              <textarea
                value={replyDraft.text}
                onChange={(e) => setReplyDraft(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Write your reply..."
                className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                autoFocus
              />
              <div className="flex items-center justify-between mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSendReply}
                  disabled={!replyDraft.text.trim()}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-600">Thanks so much</div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Copy className="w-4 h-4 mr-1" />
            </Button>
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