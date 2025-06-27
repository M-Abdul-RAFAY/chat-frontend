"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ChatSupportWidget from "@/components/ChatSupportWidgets";

function WidgetContent() {
  const searchParams = useSearchParams();
  const widgetId = searchParams.get("id");

  if (!widgetId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Invalid Widget
          </h2>
          <p className="text-gray-600">
            No widget ID provided. Please check your embed code.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <ChatSupportWidget widgetId={widgetId} />
    </div>
  );
}

export default function Widget() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading widget...</p>
          </div>
        </div>
      }
    >
      <WidgetContent />
    </Suspense>
  );
}
