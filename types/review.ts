export interface User {
  id: string;
  name: string;
  initials: string;
  backgroundColor: string;
  email?: string;
  avatar?: string;
}

export type ReviewStatus = "new" | "replied" | "archived";

export interface Review {
  id: string;
  user: User;
  rating: number;
  text: string;
  platform: string;
  timestamp: Date;
  isRecent?: boolean;
  gbpReviewId?: string; // Google Business Profile review ID
  locationId?: string; // GBP location ID
  replyText?: string; // Our reply to the review
  replyTimestamp?: Date;
  status: ReviewStatus;
  location?: {
    name: string;
    address: string;
  };
}

export interface ReplyDraft {
  id: string;
  reviewId: string;
  text: string;
  isWriting: boolean;
}

export interface GBPLocation {
  id: string;
  name: string;
  address: string;
  phone?: string;
  websiteUri?: string;
}

export interface ReviewFilters {
  reviews: string;
  site: string;
  rating: string;
  time: string;
}

export interface ReviewStats {
  total: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  responseRate: number;
  newReviews: number;
}
