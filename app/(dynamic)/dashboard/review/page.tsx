"use client";

import { ReviewsDashboard } from "@/components/ReviewsDashboard";
import { mockReviews, mockInvitedUsers } from "@/lib/mockData";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ReviewsDashboard reviews={mockReviews} invitedUsers={mockInvitedUsers} />
    </div>
  );
}
