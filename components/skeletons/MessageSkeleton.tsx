import { Skeleton } from "@/components/ui/skeleton";

export function MessageSkeleton({ isMe = false }: { isMe?: boolean }) {
  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
          isMe ? "flex-row-reverse space-x-reverse" : ""
        }`}
      >
        {!isMe && <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />}

        <div
          className={`px-4 py-2 rounded-2xl ${
            isMe ? "bg-gray-100" : "bg-gray-50"
          }`}
        >
          <Skeleton className="h-4 w-32 mb-1" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

export function MessagesListSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <MessageSkeleton />
      <MessageSkeleton isMe />
      <MessageSkeleton />
      <MessageSkeleton isMe />
      <MessageSkeleton />
    </div>
  );
}
