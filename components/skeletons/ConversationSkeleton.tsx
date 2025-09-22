import { Skeleton } from "@/components/ui/skeleton";

export function ConversationSkeleton() {
  return (
    <div className="p-4 flex items-center space-x-3 border-b border-gray-100 last:border-b-0">
      <div className="relative flex-shrink-0">
        <Skeleton className="w-12 h-12 rounded-full" />
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

export function ConversationsListSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 6 }).map((_, i) => (
        <ConversationSkeleton key={i} />
      ))}
    </div>
  );
}
