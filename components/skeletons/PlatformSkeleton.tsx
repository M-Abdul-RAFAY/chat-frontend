import { Skeleton } from "@/components/ui/skeleton";

export function PageDetailsSkeleton() {
  return (
    <div className="mb-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200/50 shadow-sm">
      <div className="flex items-center space-x-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

export function PlatformButtonSkeleton() {
  return (
    <div className="w-full flex items-center space-x-3 p-4 rounded-xl border-2 border-gray-200">
      <Skeleton className="w-12 h-12 rounded-xl" />
      <div className="text-left space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}
